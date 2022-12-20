pragma solidity ^0.4.18;

contract KittyCoreInterface {
    function cooAddress() public returns(address);
}

/// @title GeneScience implements the trait calculation for new kitties
/// @author Axiom Zen, Dieter Shirley <dete@axiomzen.co> (https://github.com/dete), Fabiano P. Soriani <fabianosoriani@gmail.com> (https://github.com/flockonus), Jordan Schalm <jordan.schalm@gmail.com> (https://github.com/jordanschalm), Abhishek Chadha <abhishek@dapperlabs.com> (https://github.com/achadha235)
/// Modified by Ryan Wei
contract GeneScience {
    bool public isGeneScience = true;

    struct Gene{
        uint8 geneLen;
        uint8 geneCount;
        // Mutate prob for each bit: (2 ** -mLogProb)
        uint8 mLogProb;
    }

    // The length of each gene.
    uint8 public geneTypeNum;
    // Initialization at here is not implemented by solidity.
    // We have to move it into the constructor.
    Gene[6] public geneTypes; /* = [
        // LSB
        // breeds+color
        Gene(10, 1, 8), // 25.6
        // status
        Gene(4, 1, 6), // 16
        // features*38
        Gene(3, 38, 8), // 2.24
        // elements*43
        Gene(2, 43, 8), // 2.98
        // artby
        Gene(12, 1, 7), // 10.67
        // style*5
        Gene(6, 5, 8) // 8.53
        // MSB
    ];
    */
    uint8 public totGeneNum;
    uint8 public maxMLogProb;

    uint256 internal constant maskLast8Bits = uint256(0xff);
    uint256 internal constant maskFirst248Bits = uint256(~0xff);

    // This is the privileged birther address. If this is set to 0, privileged birthing is disabled
    address internal _privilegedBirther;
    // Privileged window size for birthers, set to 5 blocks.
    uint256 public privilegedBirtherWindowSize = 5;
    KittyCoreInterface _kittyCore;

    constructor(address _privilegedBirtherAddress, address _kittyCoreAddress) public {
        require(_kittyCoreAddress != address(0));
        require(geneTypes.length < 256);
        // This is ugly...
        // LSB
        // breeds+color
        geneTypes[0] = Gene(10, 1, 8); // 25.6
        // status
        geneTypes[1] = Gene(4, 1, 6);  // 16
        // features*38
        geneTypes[2] = Gene(3, 38, 9); // 4.48
        // elements*43
        geneTypes[3] = Gene(2, 43, 9); // 5.96
        // artby
        geneTypes[4] = Gene(12, 1, 7); // 10.67
        // style*5
        geneTypes[5] =  Gene(6, 5, 8); // 8.53
        // MSB


        geneTypeNum = uint8(geneTypes.length);
        totGeneNum = 0;
        maxMLogProb = 0;
        uint256 totlen = 0;
        for(uint8 i = 0; i < geneTypeNum; i++) {
            totlen += geneTypes[i].geneLen * geneTypes[i].geneCount;
            totGeneNum += geneTypes[i].geneCount;
            if(maxMLogProb < geneTypes[i].mLogProb)
                maxMLogProb = geneTypes[i].mLogProb;
        }
        require(totlen <= 256);
        _kittyCore = KittyCoreInterface(_kittyCoreAddress);
        _privilegedBirther = _privilegedBirtherAddress;
    }

    /// @dev set the privileged birther address
    /// @param _birtherAddress the new birther address
    function setPrivilegedBirther(address _birtherAddress) public {
        require(msg.sender == _kittyCore.cooAddress());
        _privilegedBirther = _birtherAddress;
    }

    /// @dev given a number get a slice of any bits, at certain offset
    /// @param _n a number to be sliced
    /// @param _nbits how many bits long is the new number
    /// @param _offset how many bits to skip
    function _sliceNumber(uint256 _n, uint8 _nbits, uint8 _offset) private pure returns (uint256) {
        // mask is made by shifting left an offset number of times
        uint256 mask = uint256((2**uint256(_nbits)) - 1) << _offset;
        // AND n with mask, and trim to max of _nbits bits
        return uint256((_n & mask) >> _offset);
    }

    function _sliceXor(uint256 _n, uint8 _nbits, uint8 _offset, uint256 randBits) private pure returns (uint256) {
        // mask is made by shifting left an offset number of times
        uint256 mask = uint256((2**uint256(_nbits)) - 1) << _offset;
        // AND n with mask, and trim to max of _nbits bits
        return uint256(_n ^ (randBits & mask));
    }

    function genesToTokens(uint256 genes) public view returns (uint256[] tokens){
        uint256[] memory result = new uint256[](totGeneNum);
        uint8 offset = 0;
        uint8 geneLen;
        uint8 geneCount;
        uint8 j = 0;
        for(uint8 i = 0; i < geneTypeNum; i++) {
            geneLen = geneTypes[i].geneLen;
            geneCount = geneTypes[i].geneCount;
            while(geneCount > 0){
                result[j] = _sliceNumber(genes, geneLen, offset);
                j++;
                offset += geneLen;
                geneCount--;
            }
        }
        return result;
    }

    /// @dev the function as defined in the breeding contract - as defined in CK bible
    function mixGenes(uint256 _genes1, uint256 _genes2, uint256 _targetBlock) public view returns (uint256) {
        if (_privilegedBirther == address(0) || tx.origin == _privilegedBirther) {
            // Allow immediate births if there is no privileged birther, or if the originator
            // of the transaction is the privileged birther
            require(block.number > _targetBlock);
        } else {
            require(block.number > _targetBlock + privilegedBirtherWindowSize);
        }


        // Try to grab the hash of the "target block". This should be available the vast
        // majority of the time (it will only fail if no-one calls giveBirth() within 256
        // blocks of the target block, which is about 40 minutes. Since anyone can call
        // giveBirth() and they are rewarded with ether if it succeeds, this is quite unlikely.)
        uint256 randomN = uint256(blockhash(_targetBlock));

        if (randomN == 0) {
            // We don't want to completely bail if the target block is no-longer available,
            // nor do we want to just use the current block's hash (since it could allow a
            // caller to game the random result). Compute the most recent block that has the
            // the same value modulo 256 as the target block. The hash for this block will
            // still be available, and – while it can still change as time passes – it will
            // only change every 40 minutes. Again, someone is very likely to jump in with
            // the giveBirth() call before it can cycle too many times.
            _targetBlock = (block.number & maskFirst248Bits) + (_targetBlock & maskLast8Bits);

            // The computation above could result in a block LARGER than the current block,
            // if so, subtract 256.
            if (_targetBlock >= block.number) _targetBlock -= 256;

            randomN = uint256(blockhash(_targetBlock));

            // DEBUG ONLY
            // assert(block.number != _targetBlock);
            // assert((block.number - _targetBlock) <= 256);
            // assert(randomN != 0);
        }

        // generate 256 bits of random, using as much entropy as we can from
        // sources that can't change between calls.
        randomN = uint256(keccak256(abi.encodePacked(randomN, _genes1, _genes2, _targetBlock)));
        uint256[] memory randomGene = new uint256[](maxMLogProb+1);
        randomGene[0] = uint256(~0);
        uint8 i;
        for(i = 1; i <= maxMLogProb; i++){
            randomGene[i] = randomGene[i-1] & uint256(keccak256(abi.encodePacked(randomN, _genes1, _genes2, _targetBlock, i)));
        }

        uint256 babyGenes = 0;

        uint8 offset = 0;
        uint8 geneLen;
        uint8 geneCount;
        uint256 randBits;
        uint8 j;
        uint256 curGene;
        for(i = 0; i < geneTypeNum; i++) {
            geneLen = geneTypes[i].geneLen;
            geneCount = geneTypes[i].geneCount;
            randBits = randomGene[geneTypes[i].mLogProb];
            for(j = 0; j < geneCount; j++){
                if(randomN & 1 == 0){
                    curGene = _sliceNumber(_genes1, geneLen, offset);
                }else{
                    curGene = _sliceNumber(_genes2, geneLen, offset);
                }
                randomN >>= 1;
                babyGenes |= (curGene << offset);
                babyGenes = _sliceXor(babyGenes, geneLen, offset, randBits);

                //result.push(_sliceNumber(genes, geneLen, offset));
                offset += geneLen;
            }
        }

        return babyGenes;
    }
}