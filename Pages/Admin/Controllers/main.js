let newBtn = document.querySelector('.btn');
let dialog = document.querySelector('.modal-dialog');
let form = document.querySelector('.form-grid');
let modal = document.getElementById('md-product')

let btnSave = document.querySelector('.btn-primary');
let btnCancel = document.querySelector('.btn-ghost');
let btnClose = document.querySelector('.close');


let nameInput = document.querySelector('.name');
let priceInput = document.querySelector('.price');
let screenInput = document.querySelector('.screen');
let typeSelect = document.querySelector('.type');
let imgInput = document.querySelector('.img');
let descInput = document.querySelector('.desc');

 

newBtn.addEventListener('click', ()=> {
    form.reset();
    
    modal.hidden = false;
})

function closeModal() {
  modal.hidden = true;
  form.reset();
  edittingId = null;
}

modal.addEventListener('click', (e) => {
  
  if (e.target === modal) return closeModal();

  if (e.target.closest('.close') || e.target.closest('[data-close]')) {
    e.preventDefault();
    return closeModal();
  }
});


let fetchListPhone = () => {

phoneService.getList().then((res) =>{
    let list = res.data;
    renderListPhone(list);
}).catch((err) => {
    console.log("🚀 ~ fetchListPhone ~ err:", err);
})
}

fetchListPhone();


let renderListPhone = (Products) => {

    let contentHTML = '';
    Products.reverse().forEach((Product) => {
let {id, name , price , screen , type , img , desc} = Product;

let trString = `
<tr>
<td> ${id} </td>
<td> ${name} </td>
<td> ${price} </td>
<td> ${screen} </td> 
<td> ${type} </td>
<td>
<img src="${img}" style="width: 56px;height:56px;object-fit:cover;border-radius:8px">
 </td>
<td> ${desc} </td>

<td>
<button onclick="editPhone('${id}')" class="btn btn-success">Edit</button>
</td>

<td>
<button onclick="deletePhone('${id}')" class="btn btn-warning">Delete</button>
</td>

</tr>
`
contentHTML += trString;
    })
document.getElementById('tbody').innerHTML = contentHTML;
}


let deletePhone = (idProduct) => {

phoneService.deleteById(idProduct).then((res) => {
    console.log("🚀 ~ deletePhone ~ res:", res);
    fetchListPhone();
}).catch((err) => {
    console.log("🚀 ~ deletePhone ~ err:", err);
})

}

let getFormData = () =>{
let name = nameInput.value.trim();
let price = Number(priceInput.value);
let screen = screenInput.value.trim();
let type = typeSelect.value;
let img = imgInput.value.trim();
let desc = descInput.value.trim();

return {
name: name,
price: price,
screen: screen,
type: type,
img: img,
desc: desc,
}


}

let setFormData = (phone) => {
nameInput.value = phone.name ?? '';
priceInput.value = phone.price ?? '';
screenInput.value = phone.screen ?? '';
typeSelect.value = phone.type ?? '';
imgInput.value = phone.img ?? '';
descInput.value = phone.desc ?? '';
}

let createProduct = () =>{
    if (!checkValidate()) return;
let newProduct = getFormData();

phoneService.createProduct(newProduct).then((res)=>{
    fetchListPhone();
    console.log("thêm sản phẩm thành công")
}).catch((err) => {
    console.log("🚀 ~ createProduct ~ err:", err);
    
})
}

let edittingId = null;
let editPhone = (id) => {
edittingId = id;

phoneService.getById(id).then((res)=>{
    let product = res.data;
    setFormData(product);
    modal.hidden = false;
}).catch((err)=>{
    console.log("🚀 ~ editPhone ~ err:", err);
    alert("không thể tải lên sản phẩm");
    
})
}

let updatePhone = (newName,newPrice,newScreen,newType,newImg,newDesc) => {
    if (!checkValidate()) return;
let updateProduct ={
    name: newName,
    price: newPrice,
    screen: newScreen,
    type: newType,
    img: newImg,
    desc: newDesc,
}

phoneService.updateProduct(edittingId,updateProduct).then((result) => {
    console.log("🚀 ~ updatePhone ~ result:", result);
    checkValidate();
    fetchListPhone();
    alert("edit sản phẩm thành công");
    form.reset();
    modal.hidden = true;
    edittingId = null;
}).catch((err) => {
    console.log("🚀 ~ updatePhone ~ err:", err);
    alert("cập nhật sản phẩm thất bại");
})

}


let checkValidate = () => {
let ok = true;
let name = nameInput.value.trim();
let reName = /^[\p{L} ]+$/u;

if(name === ''){
    ok = false;
    alert("không để trống name");
} else if(!reName.test(name)){
ok = false;
alert("name chỉ gồm chữ và khoảng trắng")
}

let price = priceInput.value.trim();

if(price === ""){
    ok = false;
    alert("không để trống price");
} else {
    let rePrice = parseInt(price.replace(/[^\d]/g, ""),10);
    if(!isFinite(rePrice)){
        ok = false;
        alert("price phải là số");
    }
}

let screen = screenInput.value.trim();
if(screen === ""){
    ok = false;
    alert("không để trống screen");
} 

let type = typeSelect.value.trim().toLowerCase();
let reType = new Set(['iphone', 'samsung']);

if(!reType.has(type)){
    ok = false;
    alert("type chỉ có thể là iphone hoặc samsung");
}

return ok;

}

form.addEventListener('submit', (e) => {
  e.preventDefault();

if(!edittingId){
createProduct();
} else {
    updatePhone();
}




});