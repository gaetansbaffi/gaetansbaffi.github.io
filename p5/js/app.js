//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const api = "https://oc-p5-api.herokuapp.com/api/teddies";
// cart
let cart = [];

//buttons

let buttonsDOM = [];

// getting the products
class Products {
	async getProducts(api) {
		try {
			let result = await fetch(api);
			let data = await result.json();
			let products = data;

			products = products.map((item) => {
				const price = JSON.parse(item.price);
				const name = item.name;
				const id = item._id;
				const image = item.imageUrl;
				const description = item.description;
				return { name, price, id, image, description };
			});

			return products;
		} catch (error) {
			console.log(error);
		}
	}
}

// display products
class UI {
	displayProducts(products) {
		let result = "";
		products.forEach((product) => {
			result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img
                        src="${product.image}"
                        alt="product"
                        class="product-img"
                    />
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>Ajouter au panier
                    </button>
				</div>
				<h3>${product.name}</h3>
				<h4>${product.price / 100}.00€</h4>
				<button class="more-btn">Plus d'informations</button>
               
            </article>
            <!-- end of single product -->
            
            `;
		});
		productsDOM.innerHTML = result;
	}
	MoreInfo() {
		const moreBtns = document.querySelectorAll(".more-btn");
		moreBtns.forEach((button) => {
			let id = button.parentElement.children[0].children[1].dataset.id;
			button.addEventListener("click", (event) => {
				var newWin = window.open("produit.html", "_self");
				localStorage.setItem("id", id);
				console.log(api + "/" + id);
			});
		});
	}
	getBagButtons() {
		const buttons = [...document.querySelectorAll(".bag-btn")];
		buttonsDOM = buttons;
		buttons.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => item.id === id);
			if (inCart) {
				button.innerText = "Dans le panier";
				button.disabled = true;
			}
			button.addEventListener("click", (event) => {
				event.target.innerText = "Dans le panier";
				event.target.disabled = true;
				//get product from products
				let cartItem = { ...Storage.getProduct(id), amount: 1 };

				//add  product to the cart
				cart = [...cart, cartItem];

				//save the cart in localstorage
				Storage.saveCart(cart);
				//set cart values
				this.setCartValues(cart);
				//display cart items
				this.addCartItem(cartItem);
				//show the cart
				this.showCart();
			});
		});
	}
	setCartValues(cart) {
		let tempTotal = 0;
		let itemsTotal = 0;

		cart.map((item) => {
			tempTotal += (item.price / 100) * item.amount;
			itemsTotal += item.amount;
		});
		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemsTotal;
	}
	addCartItem(item) {
		const div = document.createElement("div");
		div.classList.add("cart-item");
		div.innerHTML = `
		<img src="${item.image}" alt="product" />
						<div>
							<h4>${item.name}</h4>
							<h5>${item.price / 100}.00€</h5>
							<span class="remove-item" data-id=${item.id}>remove</span>
						</div>
						<div>
							<i class="fas fa-chevron-up" data-id=${item.id}></i>
							<p class="item-amount">${item.amount}</p>
							<i class="fas fa-chevron-down" data-id=${item.id}></i>
						</div>
		`;
		cartContent.appendChild(div);
	}
	showCart() {
		cartOverlay.classList.add("transparentBcg");
		cartDOM.classList.add("showCart");
	}
	setupAPP() {
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);
		cartBtn.addEventListener("click", this.showCart);
		closeCartBtn.addEventListener("click", this.hideCart);
	}

	populateCart(cart) {
		cart.forEach((item) => this.addCartItem(item));
	}
	hideCart() {
		cartOverlay.classList.remove("transparentBcg");
		cartDOM.classList.remove("showCart");
	}
	cartLogic() {
		//clear cart button
		clearCartBtn.addEventListener("click", () => {
			this.clearCart();
		});
		//cart functionnality
		cartContent.addEventListener("click", (event) => {
			if (event.target.classList.contains("remove-item")) {
				let removeItem = event.target;
				let id = removeItem.dataset.id;
				cartContent.removeChild(removeItem.parentElement.parentElement);
				this.removeItem(id);
			} else if (event.target.classList.contains("fa-chevron-up")) {
				let addAmount = event.target;
				let id = addAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount = tempItem.amount + 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addAmount.nextElementSibling.innerText = tempItem.amount;
			} else if (event.target.classList.contains("fa-chevron-down")) {
				let lowerAmount = event.target;
				let id = lowerAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount = tempItem.amount - 1;
				if (tempItem.amount > 0) {
					Storage.saveCart(cart);
					this.setCartValues(cart);
					lowerAmount.previousElementSibling.innerText = tempItem.amount;
				} else {
					cartContent.removeChild(lowerAmount.parentElement.parentElement);
					this.removeItem(id);
				}
			}
		});
	}
	clearCart() {
		let cartItems = cart.map((item) => item.id);
		cartItems.forEach((id) => this.removeItem(id));
		while (cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}
		this.hideCart();
	}
	removeItem(id) {
		cart = cart.filter((item) => item.id !== id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getSingleButton(id);
		button.disabled = false;
		button.innerHTML = `<i class="fas fa-shopping-cart"></i>Ajouter au panier`;
	}
	getSingleButton(id) {
		return buttonsDOM.find((button) => button.dataset.id === id);
	}
}

//local storage
class Storage {
	static saveProducts(products) {
		localStorage.setItem("products", JSON.stringify(products));
	}
	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem("products"));
		return products.find((product) => product.id === id);
	}
	static saveCart(cart) {
		localStorage.setItem("cart", JSON.stringify(cart));
	}
	static getCart() {
		return localStorage.getItem("cart")
			? JSON.parse(localStorage.getItem("cart"))
			: [];
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const ui = new UI();
	const products = new Products();
	//setup app
	ui.setupAPP();
	//get all products
	products
		.getProducts(api)
		.then((products) => {
			ui.displayProducts(products);
			Storage.saveProducts(products);
		})
		.then(() => {
			ui.getBagButtons();
			ui.cartLogic();
			ui.MoreInfo();
		});
});