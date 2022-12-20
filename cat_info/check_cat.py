#import web3
from web3 import Web3

from .config import PROVIDER_URL, CONTRACT_ADDR # PRIVATE_KEY, ACCOUNT, 
from .abi import ABI

w3 = Web3(Web3.HTTPProvider(PROVIDER_URL))
assert w3.isConnected()

'''
w3.eth.default_account = ACCOUNT
print('Current account:', w3.eth.default_account)
balance = w3.eth.get_balance(account = ACCOUNT)
print('Account balance:', balance)
latest_block = w3.eth.block_number
print('Latest block:', latest_block)
'''

c = w3.eth.contract(address = CONTRACT_ADDR, abi = ABI)

def getKitty(cat_id):
    return c.functions.getKitty(cat_id).call()

def getGene(cat_id):
    return getKitty(cat_id)[-1]

# Functions for modifying the chain.
# Since we only queries view funcs, no need to use them.
'''

def birth(w3, nonce, c, cat_id):
    txn = c.functions.giveBirth(cat_id).build_transaction({
        'nonce' : nonce,
    })
    return txn

def breed(w3, nonce, c, matron_id, sire_id):
    txn = c.functions.breedWithAuto(matron_id, sire_id).build_transaction({
        'value' : 1000,
        'nonce' : nonce,
    })
    return txn

def create(w3, nonce, c, genes, owner = '0x' + '0'*40):
    txn = c.functions.createPromoKitty(genes, owner).build_transaction({
        'nonce' : nonce,
    })
    return txn

def createCat(w3, nonce, c):
    genes = random.randint(0, 2**256-1)
    txn = c.functions.createGen0Auction(genes).build_transaction({
        'nonce' : nonce,
    })
    return txn

def decode_events(receipt):
    for event in c.events:
        logs = event().processReceipt(receipt, errors = web3.logs.DISCARD)
        for log in logs:
            print("Event", event.event_name)
            print(log)

def call_func(w3, f, c, *args):
    nonce = w3.eth.get_transaction_count(account = ACCOUNT)
    txn = f(w3, nonce, c, *args)
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
    txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
    decode_events(receipt)
    return receipt

def call_async(n, w3, f, c, *args):
    nonce = w3.eth.get_transaction_count(account = ACCOUNT)
    txn_hashs = []
    for i in range(n):
        txn = f(w3, nonce+i, c, *args)
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        txn_hashs.append(txn_hash)
    return txn_hashs
'''
