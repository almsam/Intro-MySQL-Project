<a name="readme-top"></a>



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/almsam/data-analysis-project-revisited">
    <img src="public/img/minerals logo.png" alt="Logo" width="180" height="180">
  </a>

<h3 align="center">Nat & Sami's rare mineral store</h3>

<p align="center">
  <strong>Mission Statement</strong><br>
  " Our mission is to ensure every Canadian can get a pure sample of any rare earth metal on their doorstep within two days. "
</p>

<p align="center">
  <strong>Project Summary</strong><br>
  During my third year of undergaduate, my partner & I were tasked with making a full application (with front end & back end) to demonstrate our skills with SQL (MySQL in our case). The result of our hard work has been commited to this repo for archiving & viewing
</p>

</div>

<!-- ABOUT THE PROJECT -->
## About The Project

The project was built with CSS3 & JavaScript for the front end, as well as MySQL for the backend, & a Debian VPS rented from Hetzner for hosting

### Built By [Nat Scott](https://nats.solutions/) & [**Sami Almuallim**](https://github.com/almsam/) With: [![Docker][Docker]][Docker-url] [![JS][JS]][JS-url] [![CSS][CSS]][CSS-url]  & [![MySQL][MySQL]][MySQL-url]

[JS]: https://img.shields.io/badge/JavaScript%20-%20%23F7DF1E?logo=javascript&logoColor=FFFFFF
[JS-url]: https://www.javascript.com
[CSS]: https://img.shields.io/badge/CSS-%20%231572B6?logo=css3&logoColor=FFFFFF
[CSS-url]: https://css3.com
[Docker]: https://img.shields.io/badge/Docker%20-%20%232496ED?logo=docker&logoColor=FFFFFF
[Docker-url]: https://www.docker.com
[MySQL]: https://img.shields.io/badge/MySQL%20-%20%23f79838?logo=mysql&logoColor=%23FFFFFF&logoSize=auto
[MySQL-url]: https://www.mysql.com



<!-- FEATURES -->
## Project features

#### Main Page
- Search for products from the root page `/` and the main product directory `/listprod`.
- By default (i.e., no search query) all products are listed on `/listprod`.
- Most pages have a navigation bar fixed to the top which lists the username of the current user.

#### Shopping Cart
- Add items to the shopping cart from `/listprod` and `/product`.
- View the shopping cart at `/showcart`.
- Increment/decrement an item’s quantity at `/showcart`. If the quantity reaches zero, the item is removed from the cart.
- Remove items immediately by pressing the “Delete” link in `/showcart`.

#### Checkout
- From `/showcart`, follow a link to reach `/checkout`.
- Enter your customerId and password to check out, registering your cart as an order in the database.

#### Product Detail Page
- Review product details by following the link of the product’s name from `/listprod` to `/product?id={product id}`.
- This page may retrieve the product’s image from the database as a blob and render it if applicable.

#### User Accounts
- Access your profile at `/customer` when logged in.
- Register as a new user at `/register`, with HTML client-side validation and checks against database constraints (distinctness, not null).
- Update all fields of your profile except for customerId.
- Redirect to `/login` when not logged in. Log out at `/logout`, accessible from `/customer`.
- View all of your orders at `/listorder`. Admin users can view all orders from all customers here.

#### Admin Portal
- `/admin` is accessible only to administrators.
- `/admin/listCustomers` lists a table of all customers.
- View a table listing sales by day on `/admin`, along with a bar graph illustrating the data.
- Add new products at `/admin/addProduct`.
- Delete and update products from `/admin/productDirectory`.
- Ship orders from `/ship`.
- Add photos to products as files and directly in the database from `/admin/productAddImage`, accessed from the admin product directory using AJAX.

<!-- SOURCE LIST -->
## Source List
- [Express.js 4.x API reference](https://expressjs.com/en/4x/api.html)
- [mssql library documentation](https://www.npmjs.com/package/mssql)
- [multer library documentation](https://www.npmjs.com/package/multer)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- ["How do I upload a file with the JS fetch API?" on Stack Overflow](https://stackoverflow.com/questions/36067767/how-do-i-upload-a-file-with-the-js-fetch-api)
- ["How to get the value of a selected radio button" on Stack Overflow](https://stackoverflow.com/questions/15839169/how-to-get-the-value-of-a-selected-radio-button)

<!-- WALKTHROUGH -->
## Walkthrough
1. Start at the login page. If you don’t have an account, click “Register Here”.
2. Fill out valid information and click “Register” to be redirected to the login page. Log in to reach the main page.
3. Search from the main page to get to the product directory page, listing matching products.
4. Click the “Chai” link to see more information on this product.
5. Add the item to your cart from the product detail page. Tweak the quantity as needed and click “Checkout”.
6. After verifying your credentials, receive confirmation that your order was received.
7. Find a list of all your orders by clicking “Orders” in the nav bar.
8. Click your username in the navbar to go to the profile page.
9. Log out and log back in as “arnold”.
10. Click “Admin Panel” in the navbar.
11. Enter Nat’s order number “6” and fulfill the order.
12. Click “Add a Product” from the admin panel to fill out the form.
13. Click “Edit Products” to update, delete, and add photos to existing products in the admin product directory.
14. When adding a photo to an existing product, choose to add it as a file stored and served statically, or as a blob stored in the database.

