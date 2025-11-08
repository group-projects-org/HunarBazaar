```HunarBazaar-E-Commerce-Website/
├── dependencies/
│   └── AES_Implementation/               # AES module implementation
│       ├── include/                      # AES C++ header files
│       │   ├── AES.hpp                   # AES class definition
│       │   ├── AES_Decryption.hpp        # AES decryption logic
│       │   ├── AES_Encryption.hpp        # AES encryption logic
│       │   ├── Helper.hpp                # Helper functions for AES
│       │   ├── Key_Scheduler.hpp         # Key expansion logic
│       │   └── S_Box.hpp                 # S-Box and inverse S-Box logic
│       ├── src/                          # AES C++ source files
│       │   ├── AES.cpp                   # AES class implementation
│       │   ├── AES_Decryption.cpp        # Decryption method implementation
│       │   ├── AES_Encryption.cpp        # Encryption method implementation
│       │   ├── decrypt.cpp               # CLI utility for AES decryption
│       │   ├── encrypt.cpp               # CLI utility for AES encryption
│       │   ├── Helper.cpp                # Helper function implementations
│       │   ├── Key_Scheduler.cpp         # Key scheduler implementation
│       │   └── S_Box.cpp                 # S-Box generation logic
│       └── CMakeLists.txt                # Build configuration for AES module
│
├── backend/
│   ├── routes/                           # FastAPI routes implementation
│   │   ├── order.py                      # Ordering Products Routes
│   │   ├── OTPs.py                       # Verification OTP Routes (SendGrid + Twolio)
│   │   ├── prodcut.py                    # Products Details Routes
│   │   ├── seller_products.py            # Seller - Product Interaction Routes
│   │   ├── user.py                       # User's Data Logic and Routes
│   │   └── user_state.py                 # Loggin In Routes
│   ├── config.py                         # Backend Configuration File
│   ├── Encryption.py                     # AES integration with Flask backend
│   └── JWT.py                            # Manages JWT tokens
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       ├── Categories/               # Category-related images
│   │       ├── Discounts/                # Discount banners or icons
│   │       ├── login_background.jpeg     # Background image
│   │       ├── HunarBazaar.jpeg          # Brand Mark
│   │       ├── Hunar_Bazaar_title.jpeg   # Brand Logo
│   │       └── User.jpg                  # Default user image
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sellers/
│   │   │   │   ├── ProductModal.jsx      # Add Product Functionality
│   │   │   │   ├── Products.jsx          # Seller's Product Component
│   │   │   │   └── Seller Home.jsx       # Seller Dashboard and Homepage
│   │   │   ├── Users/
│   │   │   │   ├── cart.jsx              # Cart Logic Component
│   │   │   │   ├── Home.jsx              # Homepage Component
│   │   │   │   ├── orders.jsx            # User's Orders Component
│   │   │   │   ├── Product.jsx           # All Products Listing
│   │   │   │   └── thankyou.jsx          # Thank You Page
│   │   │   ├── Cards.jsx                 # Product, Category, Marquee Cards
│   │   │   ├── cus_agent_order.jsx       # Order Details Page
│   │   │   ├── header_footer.jsx         # Header and Footer
│   │   │   ├── Login.jsx                 # Login page logic
│   │   │   └── productDetail.jsx         # Individual product details page
│   │   ├── App.jsx                       # Main app routing and layout
│   │   ├── index.css                     # Main CSS and Tailwind File
│   │   └── main.jsx                      # React DOM rendering
│   ├── .gitignore                        # Git ignore rules
│   ├── package.json                      # NPM project dependencies
│   ├── package-lock.json                 # Locked versions of NPM packages
│   └── README.md                         # Frontend setup and usage guide
│
├── docs/
│   ├── Directory_Structure.md            # Visual and written directory structure
│   ├── HunarBazaar.jpeg                  # Brand Mark
│   ├── Hunar_Bazaar_title.jpeg           # Brand Logo
│   └── login_background.jpeg             # Brand Serving Background
│
├── .gitignore                            # Git ignore rules for project root
├── app.py                                # Flask server entry point
├── Dockerfile                            # Container setup instructions
├── Jenkinsfile                           # Building Automation Jenkins Setup
├── LICENSE                               # License for using and modifying the project
├── README.md                             # Project overview and setup instructions
└── requirements.txt                      # Python package requirements for Flask backend
```