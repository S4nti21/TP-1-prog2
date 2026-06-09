const products = [

    {
      name:"MEDIC CREME ZIP HOODIE",
      price:"$148.500"
    },
  
    {
      name:"SASHIKO HOODIE",
      price:"$129.900"
    },
  
    {
      name:"WARFARE HOODIE",
      price:"$115.900"
    },
  
    {
      name:"ARMOR PANTS",
      price:"$198.500"
    },
  
    {
      name:"ESSENTIAL TEE",
      price:"$78.000"
    },
  
    {
      name:"BLACK DENIM",
      price:"$165.000"
    },
  
    {
      name:"STREET JACKET",
      price:"$220.000"
    },
  
    {
      name:"MINIMAL HOODIE",
      price:"$119.000"
    },
  
    {
      name:"URBAN CREWNECK",
      price:"$132.000"
    },
  
    {
      name:"TACTICAL PANTS",
      price:"$188.000"
    }
  
  ];
  
  const container =
  document.getElementById("productsContainer");
  
  /* RENDER PRODUCTS */
  
  products.forEach(product => {
  
    container.innerHTML += `
  
      <div class="product-card">
  
        <div class="product-info">
  
          <div>
  
            <p class="product-category">
              STREETWEAR
            </p>
  
            <h3>
              ${product.name}
            </h3>
  
          </div>
  
          <div>
  
            <p class="product-price">
              ${product.price}
            </p>
  
            <button>
              AGREGAR AL CARRITO
            </button>
  
          </div>
  
        </div>
  
      </div>
  
    `;
  
  });
  
  /* SCROLL ANIMATION */
  
  const cards =
  document.querySelectorAll(".product-card");
  
  const observer =
  new IntersectionObserver(entries => {
  
    entries.forEach(entry => {
  
      if(entry.isIntersecting){
  
        entry.target.classList.add("show");
  
      }
  
    });
  
  },{
    threshold:0.15
  });
  
  cards.forEach(card => {
  
    observer.observe(card);
  
  });