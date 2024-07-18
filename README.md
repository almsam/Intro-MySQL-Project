<a name="readme-top"></a>



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/almsam/data-analysis-project-revisited">
    <img src="images/image_2024-02-08_214707767-modified.png" alt="Logo" width="180" height="180">
  </a>

<h3 align="center">Nat & Sami's rare mineral store</h3>

<p align="center">
  <strong>Mission Statement</strong><br>
  " Our mission is to ensure every Canadian can get a pure sample of any rare earth metal on their doorstep within two days. "
</p>

<p align="center">
  <strong>Project Summary</strong><br>
  During my third year of undergaduate, my partern & I were tasked with making a full application (with front end & back end) to demonstrate our skills with SQL (MySQL in our case). The result of our hard work has been commited to this repo for archiving & viewing
</p>

</div>

<!-- ABOUT THE PROJECT -->
## About The Project

The project was built with CSS & JavaScript for the front end, as well as MySQL for the backend, & a Debian VPS rented from Hetzner for hosting

### Built With: [![Pandas][Pandas]][Pandas-url] [![Seaborn][Seaborn]][Seaborn-url] [![Statsmodels-url][Statsmodels]][Statsmodels-url] & [![Scikit-learn][Scikit-learn]][Scikit-learn-url]


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

