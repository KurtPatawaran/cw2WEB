// Creating a Vue instance to manage the application
let webstore = new Vue({
    // Connecting to the HTML element with the ID 'app'
    el: '#app',

    // Storing information and state in data properties
    data: {
        siteName: 'After School Activities - Enroll Now!',
        showSubject: true,
        order: {
            firstName: '',
            lastName: '',
            contactNum: '',
        },
        // Changed the property name to lessons
        subjects: [], 
        cart: [],
        sortOrder: '',
        searchQuery: '',
    },

    // Triggered when the instance is created
    created: function () {
        console.log("Fetching data from the server ...");

        // Fetching lessons data from the server
        fetch('http://localhost:3000/collection/lessons')
            .then(function (response) {
                response.json().then(function (json) {
                    // Updating the subjects data property with the fetched data
                    webstore.subjects = json;
                    console.log(json);
                });
            })
            .catch(function (error) {
                console.error('Error fetching data:', error);
            });
    },

    // Watching for changes in the searchQuery property
    watch: {
        searchQuery: function (newQuery, oldQuery) {
            console.log('Search Query Changed:', newQuery);

            // Making an HTTP request to log the search query on the server
            fetch('http://localhost:3000/log-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchQuery: newQuery }),
            })
                .then(response => response.json())
                .then(responseJSON => {
                    console.log('Server Response:', responseJSON);
                })
                .catch(error => {
                    console.error('Error logging search query:', error);
                });

            // Using the computed property to get the filtered subjects
            console.log('Filtered Subjects:', this.filteredSubjects);
        },
    },

    // Methods for handling user interactions and actions
    methods: {
        addToCart: function (subject) {
            this.cart.push(subject.id);
        },

        showCheckout1() {
            // Toggling between showing lessons and the cart for checkout
            if (this.cart.length > 0) {
                this.showSubject = !this.showSubject;
            } else {
                alert('Add a lesson to the cart to proceed to checkout.');
            }

            // Fetching lessons when transitioning to the lesson page
            if (this.showSubject) {
                this.fetchLessons();
            }
        },

        showCheckout2() {
            // Toggling between showing lessons and the cart when returning from checkout
            this.showSubject = !this.showSubject;
        },

        submitForm() {
            // Submitting the order after validating details
            if (!this.order.firstName || !this.order.lastName || !this.order.contactNum) {
                alert('Please enter all required details before placing the order.');
            } else {
                alert('You Have Successfully Applied :D');
                // Calling the postOrder method and using then/catch to handle the next steps
                this.postOrder()
                    .then(() => {
                        this.cart.length = 0;
                        this.order.firstName = '';
                        this.order.lastName = '';
                        this.order.contactNum = '';
                        this.showSubject = !this.showSubject;
                        location.reload();
                    })
                    .catch(error => {
                        // Handling errors from the postOrder method
                        console.error('Error in submitForm:', error);
                    });
            }
        },

        cartCount(id) {
            // Counting occurrences of a lesson in the cart
            let count = 0;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i] === id) {
                    count++;
                }
            }
            return count;
        },

        canAddToCart: function (lesson) {
            // Checking if a lesson can be added to the cart
            return lesson.availableSpaces > this.cartCount(lesson.id);
        },

        // Removing a lesson from the cart based on its ID
        removeFromCart(id) {
            // Finding the index of the lesson with the given ID in the cart
            const index = this.cart.indexOf(id);

            // Checking if the lesson is in the cart
            if (index !== -1) {
                // Removing the lesson from the cart using splice
                this.cart.splice(index, 1);

                // If the cart is empty after removal, bringing the user back to the lesson page
                if (this.cart.length === 0) {
                    this.showSubject = !this.showSubject;
                }
            }
        },

        getLessonById(id) {
            // Getting a lesson by its ID
            return this.subjects ? this.subjects.find(lesson => lesson.id === id) : null;
        },

        sortLessons: function (order) {
            // Setting the sorting order for lessons
            this.sortOrder = order;
        },

        clearSearch() {
            // Clearing the search query
            this.searchQuery = '';
        },
        
        postOrder: function () {
            console.log(this.cart);

            // Creating an array of promises for fetch requests inside the loop
            const fetchPromises = this.cart.map((cartItem) => {
                let course = this.getLessonById(cartItem);
                let quantity = course.availableSpaces - this.cartCount(cartItem);

                return fetch(`http://localhost:3000/collection/lessons/${course._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "availableSpaces": quantity }),
                });
            });

            // Using Promise.all to wait for all fetch promises to complete
            return Promise.all(fetchPromises)
                .then(() => {
                    const orderData = {
                        firstName: this.order.firstName,
                        lastName: this.order.lastName,
                        contactNum: this.order.contactNum,
                        cart: this.cart,
                    };

                    console.log('Order Placed:', orderData);

                    // Returning the promise for the final fetch request
                    return fetch('http://localhost:3000/collection/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderData),
                    });
                })
                .then(response => response.json())
                .then(responseJSON => {
                    console.log('Order successfully submitted:', responseJSON);
                    // Moving the updateSpaces call here, inside the second then block
                    // Performing any additional actions after successful submission if needed
                })
                .catch(error => {
                    console.error('Error submitting order:', error);
                    // Handling errors as needed
                });
        },   
    },

    // Computed properties for dynamic data calculations and filtering
    computed: {
        filteredSubjects: function () {
            // Copying the subjects array to avoid modifying the original array
            let subjectsArray = this.subjects ? this.subjects.slice(0) : [];

            // Filtering subjects based on the search query
            if (this.searchQuery) {
                // Converting search query to lowercase for case-insensitive comparison
                const query = this.searchQuery.toLowerCase();

                // Using filter to include only subjects that match the search query in title or location
                subjectsArray = subjectsArray.filter(subject => 
                    subject.title.toLowerCase().includes(query) ||  
                    subject.location.toLowerCase().includes(query)
                );
            }

            // Sorting subjects based on the selected sorting order
            function compareSubject(a, b) {
                // This function compares subjects, taking a & b as object parameters representing the subjects
                const subjectA = a.title.toUpperCase(); // Titles of subjects will be turned into Capslock, ensuring it is case-insensitive.
                const subjectB = b.title.toUpperCase();

                if (subjectA > subjectB) return 1; // If subjectA is greater than SubjectB, return 1
                if (subjectA < subjectB) return -1; // If subjectA is less than SubjectB, return -1
                return 0;
            }

            function compareLocation(a, b) {
                // This function compares subjects, taking a & b as object parameters representing the location
                const locationA = a.location.toUpperCase(); // Location of subjects will be turned into Capslock, ensuring it is case-insensitive.
                const locationB = b.location.toUpperCase();

                if (locationA > locationB) return 1; // If locationA is greater than LocationB, return 1
                if (locationA < locationB) return -1; // If locationA is less than LocationB, return -1
                return 0;
            }

            function comparePrice(a, b) {
                // Comparison function for sorting objects based on their price property
                // Converting price values from strings to floating-point numbers, to allow computation between integers
                const priceA = parseFloat(a.price);
                const priceB = parseFloat(b.price);

                // Comparing prices to determine their order
                if (priceA > priceB) {
                    return 1; // Positive if priceA is greater
                } else if (priceA < priceB) {
                    return -1; // Negative if priceA is smaller
                } else {
                    return 0; // Zero if prices are equal
                }
            }

            function compareSpaces(a, b) {
                // Comparison function for sorting objects based on their availableSpaces property
                if (a.availableSpaces > b.availableSpaces) {
                    return 1; // Positive if a.availableSpaces is greater
                } else if (a.availableSpaces < b.availableSpaces) {
                    return -1; // Negative if a.availableSpaces is smaller
                } else {
                    return 0; // Zero if available spaces are equal
                }
            }

            // Sorting logic based on the selected sortOrder
            if (this.sortOrder === 'ascSubject') {
                return subjectsArray.sort(compareSubject);
            } else if (this.sortOrder === 'descSubject') {
                return subjectsArray.sort((a, b) => -compareSubject(a, b));
            } else if (this.sortOrder === 'ascLocation') {
                return subjectsArray.sort(compareLocation);
            } else if (this.sortOrder === 'descLocation') {
                return subjectsArray.sort((a, b) => -compareLocation(a, b));
            } else if (this.sortOrder === 'ascPrice') {
                return subjectsArray.sort(comparePrice);
            } else if (this.sortOrder === 'descPrice') {
                return subjectsArray.sort((a, b) => -comparePrice(a, b));
            } else if (this.sortOrder === 'ascSpaces') {
                return subjectsArray.sort(compareSpaces);
            } else if (this.sortOrder === 'descSpaces') {
                return subjectsArray.sort((a, b) => -compareSpaces(a, b));
            }

            return subjectsArray;
        },
    },
});
