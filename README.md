# DreamKittens-Frontend

DreamKittens is a combination of the blockchain game, [CryptoKitties](https://www.cryptokitties.co), and AI image generation models. It aims to employ AI to create kitty images based on its genes, which makes the images of the kitty NFTs more diverse and expressive.

[This repo](https://github.com/RyanWei0224/DreamKittens-Frontend) contains the web frontend of DreamKittens, which is responsible for connecting to Metamask on the client's browser and getting kitty images from the kitty-image-generation AI.

## Components

This repo contains the following components:

- [contracts](./contracts), which contains the two contracts to be deployed on blockchain.

- [img_cache](./img_cache), which stores the cached image of previous queries, so we do not need to repratedly make the same queries to the AI server.

- [static](./static), which stores the resource files (javascript code, css files, etc.) for the website.

- [templates](./templates) and [template_parts](./template_parts), which stores the html for the website.

	* Since all htmls share some identical parts (for eaxmple the header), we abstract out these parts and save them in *\*\_part.html* under *template_parts*. When starting the server, it will inject these parts into each html (*\*\_temp.html*) and save the result html into *templates*. With this way we can change all headers with only one modification.

	* In this step, the contract address is also injected into the javascript, so you only need to change the address in *cat_info/config.py*.

	* In stable distributions, you can change `STATIC` to `True` in *config.py* to disable this and use the html files in *templates* directly.

- [server.py](./server.py), the python code for deploying the server.

- [cat_info](./cat_info), which contains the python code that interacts with the chain. It fetches the gene of a given cat and is only used when the client requests for the image of a kitty.

	* Currently this step is done by the client providing the cat id and the server fetches the cat's genes.

	* If you don't have a HTTP Provider for the blockchain node, you can also move the gene-fetching step into javascript, and let the client request for kitty images directly by its genes.

	* However, in this way a client may *forsee* the result of any genes it wants and even make DDoS attacks on the server, so we use this safer approach.

## Deployment Flow

The deployment flow contains several steps:

1. Compile and deploy the contracts to the blockchain, and record the ABI of the contracts during compilation.

    - Firstly, you need to deploy *KittyCore*, *SaleClockAuction*, *SiringClockAuction* from [mykit.sol](./mykit.sol) and *GeneScience* from [mygene.sol](./mygene.sol).
    
    - After deploying the contracts onto the blockchain, call function *setSaleAuctionAddress*, *setSiringAuctionAddress* and *setGeneScienceAddress* of the *KittyCore* contract and set the address of the three contracts.
    
    - Then call *unpause* to start the contract. Now your contract is ready to use.
    
    - You need to record the ABI of *KittyCore* and *SaleClockAuction* during compilation.
    
2. Configure the python flask backend on the server side.

    - Set configurations about the contract in [cat_info/config.py](./cat_info/config.py), including the HTTP_PROVIDER of the blockchain node, and the ADDRESS of the contract.
    
    - Copy the ABI of *KittyCore* and *SaleClockAuction* into [abi.js](./static/js/abi.js). Copy the ABI of *KittyCore* into [abi.py](./cat_info/config.py).
    
    - Set configurations about the server in [config.py](./config.py), including the PORT of the server and the IMG\_URL (url of the AI server). If you want to connect to the AI by other ways (direct function call or using RPC in docker), you can modify the *show_img* function in [server.py](./server.py). Remember to build-up the AI service first.

    - Use `pip3 install -r requirements.txt` to install required packages (including *flask* and *web3.py*)
    
    - Run `python3 server.py` and start the server.

3. Now you can access the web frontend from your browser. Before accessing the website, remember to install Metamask into your browser and switch to the account you want to use.

## Comments

The contracts are modified from the contracts of Cryptokitties ([kitty contract](https://etherscan.io/token/0x06012c8cf97bead5deae237070f9587f8e7a266d#code#L1) and [gene contract](https://etherscan.io/address/0xb77feddb7e627a78140a2a32cac65a49ed1dba8e#code#L1)). The css files are modified on top of the css in the webpage of Cryptokitties, and some htmls are also modified from the webpage.

This is my second project on writing web apps, and in [the first one](https://github.com/RyanWei0224/WinterOlymProject) I only write htmls in a scratch-like IDE, and never touches javascript, so I had very little experience in html/js/css.

As a result, there may be bugs and strange coding styles in this project, and I would appreciate a lot if you can point it out as an Issue, or contact my email (weiyc22@mails.tsinghua.edu.cn).

Feel free to contact me with issues, ideas or any topics related to this project~

