const glb_colors = [
  'autumnmoon',
  'babypuke',
  'bridesmaid',
  'bubblegum',
  'chestnut',
  'coralsunrise',
  'cyan',
  'dahlia',
  'doridnudibranch',
  'downbythebay',
  'eclipse',
  'isotope',
  'forgetmenot',
  'gold',
  'limegreen',
  'mintgreen',
  'oasis',
  'olive',
  'palejade',
  'parakeet',
  'pinefresh',
  'pumpkin',
  'sapphire',
  'sizzurp',
  'strawberry',
  'thundergrey',
  'topaz',
  'twilightsparkle',
];

const name_list = [
  'Alice',
  'Bob',
  'Carol',
  'Dave',
  'Eve',
  'Francis',
  'Grace',
  'Hans',
  'Isabella',
  'Jason',
  'Kate',
  'Louis',
  'Margaret',
  'Nathan',
  'Olivia',
  'Paul',
  'Queen',
  'Richard',
  'Susan',
  'Thomas',
  'Uma',
  'Vivian',
  'Winnie',
  'Xander',
  'Yasmine',
  'Zach',
];



function set_text(id_name, text) {
  document.getElementById(id_name).innerText = text;
}

function remove_text(id_name){
  set_text(id_name, '');
}

// Deprecated. Now we will directly get image.
/*
function get_img(genes){
  return '/img/' + genes + '.png';
  //return 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/'+cat_id+'.svg';
}

async function set_img(id_name, cat_id){
  let account = await login().catch(err => {throw '登录错误';});
  let contract = await getKittyContract(account);
  var kinfo = await contract.methods.getKitty(cat_id).call().catch(err => {throw '获取猫猫信息失败';});
  document.getElementById(id_name).src = get_img(kinfo.genes);
}
*/

function get_img(cat_id){
  return '/img/' + cat_id + '.png';
}

async function set_img(id_name, url){
  document.getElementById(id_name).src = url;
}

function set_link(id_name, href){
  document.getElementById(id_name).href = href;
}

function set_html(id_name, html){
  //console.log(id_name);
  document.getElementById(id_name).innerHTML = html;
}

function del_elem(id_name){
  document.getElementById(id_name).remove();
}

function set_button(id_name, html, f){
  var cell = document.getElementById(id_name);
  //console.log(cell, id_name);
  cell.innerHTML = html;
  cell.getElementsByTagName('button')[0].onclick = f;
}

function to_ether(price_wei, precision) {
  var price_eth = Web3.utils.fromWei(price_wei, 'ether');
  price_eth = Number.parseFloat(price_eth);
  price_eth = price_eth.toPrecision(precision);
  if(price_eth.indexOf('.') >= 0){
    while(price_eth.slice(-1) == '0'){
      price_eth = price_eth.slice(0, -1);
    }
    if(price_eth.slice(-1) == '.'){
      price_eth = price_eth.slice(0, -1);
    }
  }
  return price_eth;
}

function getContract(account, abi, addr){
  try{
    let contract = new web3.eth.Contract(abi, addr, {
      from: account,
      // gas: 300000,
    });
    return contract;
  }catch(err){
    throw '合约获取失败';
  }
}

async function getKittyContract(account){
  //let contractAddress = '0xe1792cF0B905E927935138A8b2C04e1F94eDecc1';
  let contractAddress = '{{address}}';
  return getContract(account, kitty_abi, contractAddress);
}

// Deprecated
/*
async function getSaleAuctionContractOld(account){
  let contractAddress = '0x...';
  return getContract(account, sale_auc_abi, contractAddress);
}
*/

async function getSaleAuctionContract(account, kcon){
  let sale_Addr = await kcon.methods.saleAuction().call();
  return getContract(account, sale_auc_abi, sale_Addr);
}

async function login_only() {
  if (typeof window.ethereum == 'undefined' || !ethereum.isMetaMask) {
    window.alert('MetaMask is not installed!');
    //location.reload();
    throw 'MetaMask is not installed!';
  }
  web3 = new Web3(window.ethereum);
  return web3;
}

async function login_getacc(web3){
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' }); // web3.eth.getAccounts();
  const account = web3.utils.toChecksumAddress(accounts[0]);
  return account;
}

async function login() {
  web3 = await login_only();
  return await login_getacc(web3);
}

function breed(matron_id, sire_id){
  async function _breed(matron_id, sire_id){
    let account = await login().catch(err => {throw '登录错误';});
    let contract = await getKittyContract(account);
    let fee = await contract.methods.autoBirthFee().call()
                .catch(err => {throw '无法获取交配费用'});
    _ = await contract.methods.breedWithAuto(matron_id, sire_id).call({
                value: fee,
              }).catch(err => {throw '无法交配'});
    _ = await contract.methods.breedWithAuto(matron_id, sire_id).send({
                value: fee,
              }).catch(err => {throw '无法上链...'});
  }
  _breed(matron_id, sire_id).then(res => {window.alert('成功配偶'); window.location.reload();}).catch(err => window.alert(err));
}

function get_name(cat_id, maxn = -1){
  cat_id -= 1;
  if(cat_id < 0)
    return '';
  var n=1;
  const nl=name_list.length;
  var m=nl;
  while(cat_id >= m){
    cat_id -= m;
    m *= name_list.length;
    n += 1;
  }
  var name = '';
  for (; n > 0; n--) {
    m = cat_id % nl;
    cat_id = Math.floor(cat_id / nl);
    name += name_list[m] + ' ';
  }
  name = name.slice(0, -1);
  if(maxn >= 0 && name.length > maxn){
    name = name.substr(0, maxn-2) + '...';
  }
  return name;
}

function get_id_name(cat_id, maxn = 16){
  return '#' + cat_id + ' ' + get_name(cat_id, maxn);
}

function get_catpage(cat_id){
  return '/cat?cat_id='+cat_id;
}

function set_cell_html(cell, cat_id, cat_strs, n){
  let cell_name_all = `cell_`+n;
  let cat_color = glb_colors[cat_id % glb_colors.length];
  let cell_html = `
  <table style="width:125px;">
    <tr><td>
      <a href="`+get_catpage(cat_id)+`">
        <div class="KittyCard KittyCard--display-thumbnail KittyCard--color-`+cat_color+`" role="button" data-view="KittyCard">
          <div class="KittyCard-main">
            <div class="KittyCard-main-container">
              <div class="KittyCard-imageContainer KittyCard-imageContainer--shadow">
                <img class="KittyCard-image" id="`+cell_name_all+`" alt="加载中...">
              </div>
            </div>
          </div>
        </div>
      </a>
    </td></tr>
    `;
  var funcs = [];
  for (var i = 0; i < cat_strs.length; i++) {
    if(cat_strs[i] instanceof Promise){
      let cell_name = cell_name_all+'_'+i;
      cell_html += `
        <tr><td>
          <center style="font-size:16px" id="`+cell_name+`">查询中...</center>
        </td></tr>
      `;
      funcs.push([async function(id_name, prom){
        let res = await prom;
        if(res instanceof Array){
          var id_obj = document.getElementById(id_name);
          id_obj.innerText = res[0];
          id_obj.style.color = res[1];
        }else{
          document.getElementById(id_name).innerText = res;
        }
      },cell_name,cat_strs[i]]);
    }else{
      var color_str = '';
      var cur_str = cat_strs[i];
      if(cat_strs[i] instanceof Array){
        cur_str = cat_strs[i][0];
        color_str = ` color:` + cat_strs[i][1];
      }
      cell_html += `
        <tr><td>
          <center style="font-size:16px;`+color_str+`">` + cur_str + `</center>
        </td></tr>
      `;
    }
  }
  cell_html += `
  </table>
  `;
  cell.innerHTML = cell_html;
  set_img(cell_name_all, get_img(cat_id));
  for (var i = funcs.length - 1; i >= 0; i--) {
    var f = funcs[i];
    f[0](f[1], f[2]);
  }
}

async function getKitties(){
  let account = await login().catch(err => {throw '登录错误';});
  let contract = await getKittyContract(account);
  let scontract = await getSaleAuctionContract(account, contract);

  let cats = await contract.methods.tokensOfOwner(account).call()
                .catch(err => {throw '无法获取个人猫猫'});
  let all_sale = await contract.methods.tokensOfOwner(scontract._address).call()
                .catch(err => {throw '无法获取正在售卖的猫猫'});
  let cats_sale = [];
  for (var i = 0; i < all_sale.length; i++) {
    var cat_id = all_sale[i];
    var sale_info = await scontract.methods.getAuction(cat_id).call();
    //console.log(sale_info, account);
    if(sale_info.seller == account){
      cats_sale.push(cat_id);
    }
  }

  let table = document.getElementById('kitty_table');
  let n = 0;
  for (var i = cats.length - 1; i >= 0; i--) {
    var cat_id = cats[i];
    if(n % 8 == 0){
      var row = table.insertRow(-1);
      row.setAttribute('style', 'height: 200px;');
    }
    let cell = row.insertCell(-1);
    let status_prom = contract.methods.getKitty(cat_id).call()
    .catch(err => {return ['获取状态失败', 'red'];})
    .then(kinfo => {
      if(kinfo.isReady){
        if(kinfo.isGestating){
          return ['可以分娩', 'green'];
        }else{
          return ['空闲', 'blue'];
        }
      }else{
        if(kinfo.isGestating){
          return ['怀孕中', 'darkorange'];
        }else{
          return ['冷却中', 'fuchsia'];
        }
      }
    });
    set_cell_html(cell, cat_id, [get_id_name(cat_id), status_prom], 'kitty_table_' + n);
    n += 1;
  }
  for (var i = cats_sale.length - 1; i >= 0; i--) {
    var cat_id = cats_sale[i];
    if(n % 8 == 0){
      var row = table.insertRow(-1);
      row.setAttribute('style', 'height: 200px;');
    }
    let cell = row.insertCell(-1);
    set_cell_html(cell, cat_id, [get_id_name(cat_id), ['售卖中', 'black']], 'kitty_table_' + n);
    n += 1;
  }
  if(n > 0){
    remove_text('kitty_load');
  }else{
    set_text('kitty_load', '无猫猫记录');
  }
}

async function getSales(){
  let account = await login().catch(err => {throw '登录错误';});
  let contract = await getKittyContract(account);
  let scontract = await getSaleAuctionContract(account, contract);

  let cats = await contract.methods.tokensOfOwner(scontract._address).call()
                .catch(err => {throw '无法获取猫'});
  let table = document.getElementById('sale_table');
  let n = 0;
  for (var i = cats.length - 1; i >= 0; i--) {
    let cat_id = cats[i];
    let price_prom = scontract.methods.getCurrentPrice(cat_id).call()
                        .then(price => {return to_ether(price, 4) + ' ETH';});
    if(n % 8 == 0){
      var row = table.insertRow(-1);
      row.setAttribute('style', 'height: 200px;');
    }
    let cell = row.insertCell(-1);
    set_cell_html(cell, cat_id, [get_id_name(cat_id), price_prom], 'sale_table_' + n);
    n += 1;
  }
  if(n > 0){
    remove_text('sale_load');
  }else{
    set_text('sale_load', '无售卖记录');
  }
}

function create_sale(cat_id, val_wei){
  async function _create_sale(cat_id, val_wei){
    let account = await login().catch(err => {throw '登录错误';});
    let contract = await getKittyContract(account);
    await contract.methods.createSaleAuction(cat_id, val_wei, val_wei, 60).send()
                        .catch(err => {throw '无法设置售卖'});
  }
  _create_sale(cat_id, val_wei).then(res => {
            window.alert('成功设置售卖');
            window.location.reload();
          }).catch(err => window.alert(err));
}

function remove_sale(cat_id){
  async function _remove_sale(cat_id, val_wei){
    let account = await login().catch(err => {throw '登录错误';});
    let contract = await getKittyContract(account);
    let scontract = await getSaleAuctionContract(account, contract);
    await scontract.methods.cancelAuction(cat_id).send()
                        .catch(err => {throw '无法取消售卖'});
  }
  _remove_sale(cat_id).then(res => {
            window.alert('成功取消售卖');
            window.location.reload();
          }).catch(err => window.alert(err));
}

function buy(cat_id, price_wei){
  async function _buy(cat_id, price_wei){
    let account = await login().catch(err => {throw '登录错误';});
    let contract = await getKittyContract(account);
    let scontract = await getSaleAuctionContract(account, contract);
    await scontract.methods.bid(cat_id).send({
      value: price_wei,
    }).catch(err => {throw '无法购买'});
  }
  _buy(cat_id, price_wei).then(res => {
            window.alert('成功购买');
            window.location.reload();
          }).catch(err => window.alert(err));
}

function give_birth(cat_id){
  async function _give_birth(cat_id){
    let account = await login().catch(err => {throw '登录错误';});
    let contract = await getKittyContract(account);
    let child_id = await contract.methods.giveBirth(cat_id).send()
                        .catch(err => {throw '无法生小猫'});
    //console.log(child_id);
    child_id = child_id.events.Birth.returnValues.kittyId;
    return child_id;
  }
  _give_birth(cat_id).then(res => {
            window.open(get_catpage(res), '_blank');
            window.alert('成功生出小猫#'+res);
            window.location.reload();
          }).catch(err => window.alert(err));
}

async function get_breed_list(cat_id){
  let account = await login().catch(err => {throw '登录错误';});
  let contract = await getKittyContract(account);

  let cats = await contract.methods.tokensOfOwner(account).call()
                .catch(err => {throw '无法获取个人猫猫'});
  let blist = [];
  for (var i = 0; i < cats.length; i++) {
    try{
      var other_id = cats[i];
      if(! await contract.methods.canBreedWith(cat_id, other_id).call()){
        continue;
      }
      if(! await contract.methods.isReadyToBreed(other_id).call()){
        continue;
      }
      blist.push(other_id);
    }catch(err){
    }
  }
  return blist;
}


function getTimeStr (t) {
  const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
  const d = new Date(t*1000);
  
  return [`${pad(d.getFullYear(),4)}/${pad(d.getMonth()+1)}/${pad(d.getDate())}`, `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`];
}

function period_to_str(t, small_font = false){
  var n = [];
  const m = ['秒', '分', '时', '天'];
  n[0] = t % 60;
  t = Math.floor(t/60);
  n[1] = t % 60;
  t = Math.floor(t/60);
  n[2] = t % 24;
  t = Math.floor(t/24);
  n[3] = t;
  var ans = '';
  var x = 0;
  for (var i = 3; i >= 0; i--) {
    if(n[i] > 0){
      x += 1;
      if(x >= 4){
        continue;
      }
      ans += n[i];
      if(small_font){
        ans += `<small style="font-size: 60%;">`;
      }
      ans += m[i];
      if(small_font){
        ans += `</small>`;
      }
      ans += ` `;
      //console.log(ans);
    }
  }
  if(ans == ''){
    ans = '0秒 ';
  }
  ans = ans.slice(0, -1);
  //console.log(ans);
  return ans;
}

async function get_info(cat_id){
  let web3 = await login_only().catch(err => {throw '登录错误';});
  let account = await login_getacc(web3).catch(err => {throw '登录错误';});

  let contract = await getKittyContract(account);
  let scontract = await getSaleAuctionContract(account, contract);

  try{
    var kinfo = await contract.methods.getKitty(cat_id).call();
  }catch(err){
    window.open('/err?msg='+err_msg, '_self');
    return;
  }
  var info = [];

  info.img = get_img(cat_id);
  info.name = get_name(cat_id);
  info.generation = kinfo.generation + ' 代';
  info.genes = Web3.utils.numberToHex(kinfo.genes).substr(2);
  ts = getTimeStr(kinfo.birthTime);
  info.birthday = ts[0];
  info.birth_time = ts[0] + ' ' + ts[1];
  info._birth = false;
  var block_num = await web3.eth.getBlockNumber().catch(err => {window.alert('错误：获取当前区块失败')});
  //console.log(kinfo.nextActionAt, block_num);
  block_num = kinfo.nextActionAt - block_num;
  if(kinfo.isReady || block_num <= 0){
    if(kinfo.isGestating){
      info.status = '怀孕中 (可以分娩)';
      info._birth = true;
    }else{
      info.status = '空闲';
      info._breed = true;
    }
  }else{
    block_num *= await contract.methods.secondsPerBlock().call().catch(err => {window.alert('错误：获取冷却时间失败');});
    var cd_str = '冷却中 ' + period_to_str(block_num);
    if(kinfo.isGestating){
      info.status = '怀孕中 (' + cd_str + ')';
    }else{
      info.status = cd_str;
    }
  }

  if(kinfo.matronId != 0){
    info.mother_link = get_catpage(kinfo.matronId);
    info.mother_img = get_img(kinfo.matronId);
    info.mother_card = ' KittyCard--color-' + glb_colors[kinfo.matronId % glb_colors.length];
  }

  if(kinfo.sireId != 0){
    info.father_link = get_catpage(kinfo.sireId);
    info.father_img = get_img(kinfo.sireId);
    info.father_card = ' KittyCard--color-' + glb_colors[kinfo.sireId % glb_colors.length];
  }

  const cd = await contract.methods.cooldowns(kinfo.cooldownIndex).call().catch(err => {window.alert('错误：获取冷却时间失败');});

  info.cooldown = '冷却时间: ' + period_to_str(cd);

  var owner = await contract.methods.ownerOf(cat_id).call().catch(err => {window.alert('错误：获取主人失败');});
  info._in_sale = false;
  //console.log(owner, scontract._address);
  if(owner == scontract._address){
    const sale_info = await scontract.methods.getAuction(cat_id).call().catch(err => {window.alert('错误：获取售卖信息失败');});
    const sale_price = await scontract.methods.getCurrentPrice(cat_id).call().catch(err => {window.alert('错误：获取售卖价格失败');});
    owner = sale_info.seller;
    info._in_sale = true;
    info.sale_price = sale_price //Web3.utils.fromWei(sale_price, 'ether');
    info.sale_time = Math.floor((Date.now() - sale_info.startedAt * 1000) / 1000);
  }
  info._is_mine = false;
  if(owner == account){
    info._is_mine = true;
    info.full_owner = owner + ' (本账号)';
    info.owner_addr = '本账号';
  }else{
    info.full_owner = owner;
    // 0xabc...def
    info.owner_addr = owner.substr(0, 5) + '...' + owner.substr(-3);
  }
  if(info._in_sale){
    if(owner == contract._address){
      // Initial cats.
      info.full_owner = '无 (初始猫猫)';
      info.owner_addr = '无 (初始售卖)';
    }else{
      info.full_owner += ' (售卖中)';
      info.owner_addr += ' (售卖中)';
    }
  }

  set_img('self_img', info.img);

  set_img('cat_image', info.img);
  set_text('cat_name', info.name);
  set_text('owner_addr', info.owner_addr);
  set_text('generation', info.generation);
  set_text('cooldown', info.cooldown);
  if(info.mother_link == null || info.father_link == null){
    set_html('parent_elem', `<p id="comment" style="margin-bottom: 20px;">初代猫没有父母喵~</p>`);
  }else{
    set_link('mother_link', info.mother_link);
    document.getElementById('mother_card').className += info.mother_card;
    set_img('mother_img', info.mother_img);
    set_link('father_link', info.father_link);
    document.getElementById('father_card').className += info.father_card;
    set_img('father_img', info.father_img);
  }
  set_text('comment', '喵呜~');
  set_text('birthday', info.birthday);
  set_text('birth_time', info.birth_time);
  set_text('full_owner', info.full_owner);
  set_text('genes', info.genes);
  set_text('status', info.status);

  if(info._is_mine){
    if(info._in_sale){
      var price_eth = to_ether(info.sale_price, 6);
      var html =
        `
          <div class="KittyBid-box">
            <h3 class="KittyBid-box-title">售卖价格</h3>
            <span class="KittyBid-box-subtitle">`+price_eth+` <small>ETH</small></span>
          </div>
          <div class="KittyBid-box">
            <h3 class="KittyBid-box-title">售卖已进行</h3>
            <span class="KittyBid-box-subtitle">` + period_to_str(info.sale_time, true) + `</span>
          </div>
          <div class="KittyBid-action">
            <div class="_2kvQkVxvlo5cXr2ZOAqWDa">
              <button class="ButtonV2 ButtonV2--size-default ButtonV2--color-orange" data-tracking="mxpnl-buypage-buynow" id="cancel_button">
                <span class="ButtonV2-children">撤回售卖</span>
              </button>
            </div>
          </div>
        `;
      set_button('sale_elem', html, function(){
        remove_sale(cat_id);
      });
    }else if(!kinfo.isGestating){
      var html =
        `
          <div class="ModalV2-header">
            <div class="KittyOfferModal-heading">
              <span class="KittyOfferModal-title">售卖价格</span>
              <span class="KittyOfferModal-description">至少 0.03 ETH</span>
            </div>
            <div class="KittyOfferModal-offerInput">
              <input type="number" class="NumberInput" step="0.1" min="0.03" value="0.03" id="sell_val">
            </div>
            <div>
              <span class="KittyBid-box-subtitle"><small>ETH</small></span>
            </div>
          </div>
          <div class="KittyBid-action">
            <div class="_2kvQkVxvlo5cXr2ZOAqWDa">
              <button class="ButtonV2 ButtonV2--size-default ButtonV2--color-orange" data-tracking="mxpnl-buypage-buynow" id="sell_button">
                <span class="ButtonV2-children">出价！</span>
              </button>
            </div>
          </div>
        `;
      set_button('sale_elem', html, function(){
        let v = document.getElementById('sell_val').value;
        let val_wei = Web3.utils.toWei(v, 'ether');
        create_sale(cat_id, val_wei);
      });
    }else{
      del_elem('sale_tot_elem');
    }
  }else{
    if(info._in_sale){
      var price_eth = to_ether(info.sale_price, 6);
      var html =
        `
          <div class="KittyBid-box">
            <h3 class="KittyBid-box-title">即时购买价格</h3>
            <span class="KittyBid-box-subtitle">`+price_eth+` <small>ETH</small></span>
          </div>
          <div class="KittyBid-action">
            <div class="_2kvQkVxvlo5cXr2ZOAqWDa">
              <button class="ButtonV2 ButtonV2--size-default ButtonV2--color-orange" data-tracking="mxpnl-buypage-buynow" id="buy_button">
                <span class="ButtonV2-children">买买买！</span>
              </button>
            </div>
          </div>
        `;
      set_button('sale_elem', html, function(){
        /*
        let price = info.sale_price;
        let price_wei = Web3.utils.toWei(price, 'ether');
        */
        let price_wei = info.sale_price;
        buy(cat_id, price_wei);
      });
    }else{
      del_elem('sale_tot_elem');
    }
  }

  if(info._birth && info._is_mine){
    var html =
      `
      <div class="KittyBid KittyBid--sale">
        <div class="KittyBid-boxes">
          <div class="KittyBid-box">
            <span class="KittyOfferModal-title">猫猫准备好生小猫了~</span>
            <span class="KittyOfferModal-description" style="justify-content: left;">已怀孕，等待分娩中...</span>
          </div>
          <div class="KittyBid-action">
            <div class="_2kvQkVxvlo5cXr2ZOAqWDa">
              <button class="ButtonV2 ButtonV2--size-default ButtonV2--color-orange" data-tracking="mxpnl-buypage-buynow" id="birth_button">
                <span class="ButtonV2-children">生小猫喵~</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      `;
    set_button('birth_elem', html, function(){
      give_birth(cat_id);
    });
  }

  function set_blist(blist){
    if(blist.length == 0){
      set_html('mating_elem', `<p id="comment" style="margin-bottom: 20px;">没有配种对象喵~</p>`);
      return;
    }
    //console.log(blist);
    var sel = document.getElementById('mates');
    sel.onchange = function(){
      set_link('mate_link', get_catpage(sel.value));
      var mcard = document.getElementById('mate_card');
      //console.log(mcard.className);
      var str = mcard.className.substr(0, mcard.className.lastIndexOf(' ')+1);
      str += 'KittyCard--color-' + glb_colors[sel.value % glb_colors.length];
      mcard.className = str;
      set_img('mate_img', get_img(sel.value));
    };
    for (var i = 0; i < blist.length; i++) {
      var option = document.createElement("option");
      option.text = get_id_name(blist[i], 10);
      option.value = blist[i];
      sel.add(option);
    }
    option.selected = "selected";
    sel.onchange();
    var mbutton = document.getElementById('mate_button');
    mbutton.onclick = function(){
      breed(cat_id, sel.value);
    }
  }
  var can_breed = await contract.methods.isReadyToBreed(cat_id).call().catch(err => {window.alert('错误：获取可交配状态失败'); set_blist([]);});
  if(!info._is_mine){
    set_html('mating_elem', `<p id="comment" style="margin-bottom: 20px;">是别人的猫猫喵~</p>`);
  }else if(info._in_sale){
    set_html('mating_elem', `<p id="comment" style="margin-bottom: 20px;">拍卖的猫猫不能交配喵~</p>`);
  }else if(can_breed){
    await get_breed_list(cat_id).then(blist => {set_blist(blist);})
            .catch(err => {window.alert('错误：获取可交配猫猫失败\n'+err); set_blist([]);});
  }else{
    // Can't breed!
    set_html('mating_elem', `<p id="comment" style="margin-bottom: 20px;">现在还不能交配喵~</p>`);
  }
}