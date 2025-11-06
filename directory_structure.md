```Trendify-E-Commerce-Website/
├── dependencies/                         # Stores the project dependencies
│   ├── AES_Implementation/               # AES module implementation
│   │   ├── include/                      # AES C++ header files
│   │   │   ├── AES.hpp                   # AES class definition
│   │   │   ├── AES_Decryption.hpp        # AES decryption logic
│   │   │   ├── AES_Encryption.hpp        # AES encryption logic
│   │   │   ├── Helper.hpp                # Helper functions for AES
│   │   │   ├── Key_Scheduler.hpp         # Key expansion logic
│   │   │   └── S_Box.hpp                 # S-Box and inverse S-Box logic
│   │   ├── src/                          # AES C++ source files
│   │   │   ├── AES.cpp                   # AES class implementation
│   │   │   ├── AES_Decryption.cpp        # Decryption method implementation
│   │   │   ├── AES_Encryption.cpp        # Encryption method implementation
│   │   │   ├── decrypt.cpp               # CLI utility for AES decryption
│   │   │   ├── encrypt.cpp               # CLI utility for AES encryption
│   │   │   ├── Helper.cpp                # Helper function implementations
│   │   │   ├── Key_Scheduler.cpp         # Key scheduler implementation
│   │   │   └── S_Box.cpp                 # S-Box generation logic
│   │   └── CMakeLists.txt                # Build configuration for AES module
│   └── user_context.json                 # Stores frontend app and user state
│
├── backend/                              # Backend API (Flask) for encryption and user handling
│   ├── Encryption.py                     # AES integration with Flask backend
│   ├── order.py                          # Handles order-related backend routes
│   ├── user_context_manager.py           # Manages user session and context
│   └── user_state.py                     # Manages login, logout features
│
├── frontend/                             # Frontend code built with React.js
│   ├── public/                           # Static assets served directly
│   │   └── assets/                       # Images and static files
│   │       ├── Categories/               # Category-related images
│   │       ├── Discount/                 # Discount banners or icons
│   │       ├── background.jpeg           # Background image
│   │       ├── Trendify.jpeg             # Logo or featured image
│   │       └── User.jpg                  # Default user image
│   ├── src/                              # React components and logic
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── CSS/                      # Component-specific CSS
│   │   │   │   ├── checkout.css          # Styling for checkout page
│   │   │   │   ├── Header_Footer.css     # Styling for header and footer
│   │   │   │   ├── login.css             # Styling for login page
│   │   │   │   ├── product.css           # Styling for product page
│   │   │   │   ├── slideshow.css         # Styling for slideshow/banner
│   │   │   │   └── thankyou.css          # Styling for thank you/confirmation page
│   │   │   ├── cart.js                   # Shopping cart logic and UI
│   │   │   ├── header_footer.js          # Header and footer components
│   │   │   ├── Home.js                   # Homepage component
│   │   │   ├── Login.js                  # Login page logic
│   │   │   ├── Product_List.js           # Product listing page
│   │   │   ├── productPage.js            # Individual product details page
│   │   │   └── thankyou.js               # Thank You Page
│   │   ├── App.js                        # Main app routing and layout
│   │   └── index.js                      # React DOM rendering
│   ├── .gitignore                        # Git ignore rules
│   ├── package.json                      # NPM project dependencies
│   ├── package-lock.json                 # Locked versions of NPM packages
│   └── README.md                         # Frontend setup and usage guide
│
├── docs/                                 # Documentation and diagrams
│   └── Directory_Structure.md            # Visual and written directory structure
│
├── .gitignore                            # Git ignore rules for project root
├── app.py                                # Flask server entry point
├── Dockerfile                            # Container setup instructions
├── LICENSE                               # License for using and modifying the project
├── README.md                             # Project overview and setup instructions
└── requirements.txt                      # Python package requirements for Flask backend```
