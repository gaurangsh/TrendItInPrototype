var addToCartNodes = document.querySelectorAll("#addToCartBtn")

addToCartNodes.forEach(function(element){
  element.addEventListener("click",function(event){
    addToCart(element.parentNode.getAttribute("id"));
  })
})

function addToCart(id){
  var request = new XMLHttpRequest();
  
  request.open("post","/cart");
  request.setRequestHeader("Content-type","application/json");

  request.send(JSON.stringify({id:id}));

  request.addEventListener("load",function(){
    if(request.status === 401){
      alert("Please Login")
    }else if(request.status == 200){
      alert("Item Added to Cart")
    }
    console.log(request)
  })
}