// const { response } = require("express");

// Create a Vue instance to manage the application
let webstore = new Vue({
    // Connect to the HTML element with the ID 'app'
    el: '#app',

    // Data properties to store information and state
    data: {
        siteName: 'After School Activities - Enroll Now!',
        showSubject: true,
        order: {
            firstName: '',
            lastName: '',
            contactNum: '',
        },
        subjects: [], // Updated property name to lessons
        cart: [],
        sortOrder: '',
        searchQuery: '',
    },

    created: function () {
        console.log("Requesting data from the server ...");
    
        fetch('http://localhost:3000/collection/lessons')
            .then(function (response) {
                response.json().then(function (json) {
                    // Update the subjects data property with the fetched data
                    webstore.subjects = json;
                    console.log(json);
                });
            })
            .catch(function (error) {
                console.error('Error fetching data:', error);
            });
    },

    // Methods for handling user interactions and actions
    methods: {
        addToCart: function (subject) {
            this.cart.push(subject.id);
        },

        showCheckout1() {
            // Toggle between showing lessons and the cart for checkout
            if (this.cart.length > 0) {
                this.showSubject = !this.showSubject;
            } else {
                alert('Add a lesson to the cart to proceed to checkout.');
            }

            // Fetch lessons when transitioning to the lesson page
            if (this.showSubject) {
                this.fetchLessons();
            }
        },

        showCheckout2() {
            // Toggle between showing lessons and the cart when returning from checkout
            this.showSubject = !this.showSubject;
        },

        submitForm() {
            // Submit the order after validating details
            if (!this.order.firstName || !this.order.lastName || !this.order.contactNum) {
                alert('Please enter all required details before placing the order.');
            } else {
                alert('You Have Successfully Applied :D');
                this.postOrder(); // Call the method to post the order to the server
                this.cart.length = 0;
                this.order.firstName = '';
                this.order.lastName = '';
                this.order.contactNum = '';
                this.showSubject = !this.showSubject;
            }
        },

        cartCount(id) {
            // Count occurrences of a lesson in the cart
            let count = 0;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i] === id) {
                    count++;
                }
            }
            return count;
        },

        canAddToCart: function (lesson) {
            // Check if a lesson can be added to the cart
            return lesson.availableSpaces > this.cartCount(lesson.id);
        },

        // Remove a lesson from the cart based on its ID
        removeFromCart(id) {
            // Find the index of the lesson with the given ID in the cart
            const index = this.cart.indexOf(id);

            // Check if the lesson is in the cart
            if (index !== -1) {
                // Remove the lesson from the cart using splice
                this.cart.splice(index, 1);

                // If the cart is empty after removal, bring the user back to the lesson page
                if (this.cart.length === 0) {
                    this.showSubject = !this.showSubject;
                }
            }
        },

        getLessonById(id) {
            // Get a lesson by its ID
            return this.subjects ? this.subjects.find(lesson => lesson.id === id) : null;
        },

        sortLessons: function (order) {
            // Set the sorting order for lessons
            this.sortOrder = order;
        },

        clearSearch() {
            // Clear the search query
            this.searchQuery = '';
        },

        postOrder: function () {
            // Create an order object to be sent to the server
            const orderData = {
                firstName: this.order.firstName,
                lastName: this.order.lastName,
                contactNum: this.order.contactNum,
                cart: this.cart,  // Include the cart details in the order
            };
        
            // Send a POST request to the server
            fetch('http://localhost:3000/collection/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            })
            .then(response => response.json())
            .then(responseJSON => {
                console.log('Order successfully submitted:', responseJSON);
        
                // Move the updateSpaces call here, inside the second then block
                this.updateSpaces();
        
                // Perform any additional actions after successful submission if needed
            })
            .catch(error => {
                console.error('Error submitting order:', error);
                // Handle errors as needed
            });
        },
        
        updateSpaces: function () {
            console.log('updateSpaces method called.');
        
            // Save the current context
            const self = this;
        
            if (this.cart) {
                console.log('this.cart:', this.cart);
            // Loop through each item in the cart
            this.cart.forEach(function (itemId) {
                console.log("cart.forEach");
                const subject = this.getLessonById(itemId);
                console.log('Subject for itemId', itemId, ':', subject);
        
                if (subject) {
                    const updatedSpaces = subject.availableSpaces - 1;
                    const payload = { availableSpaces: updatedSpaces, subjectId: itemId };
        
                    // Send a PUT request to update the available spaces for the subject
                    fetch(`http://localhost:3000/collection/lessons/${itemId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    })
                        .then(response => response.json())
                        .then(responseJSON => {
                            console.log(`Response from server for subject ${itemId}:`, responseJSON);
        
                            // Check if the response indicates success
                            if (responseJSON.msg === 'success') {
                                console.log('Spaces updated successfully!');
                                // Update the subject with the returned updated document
                                self.subjects = self.subjects.map(s => (s._id === itemId ? responseJSON.updatedDocument : s));
                            } else {
                                console.error('Error updating spaces:', responseJSON.error);
                            }
        
                            // Perform any additional actions after successful update if needed
                        })
                        .catch(error => {
                            console.error(`Error updating spaces for subject ${itemId}:`, error);
                            // Handle errors as needed
                        });
                }
            });       
            // Perform any additional actions after all successful updates if needed
            console.log('All fetch requests completed.');
            }else {
                // Log an error message if 'cart' is undefined or null
                console.error('Cart is undefined or null.');
            }
        },                   
    },

    // Computed properties for dynamic data calculations and filtering
    computed: {
        filteredSubjects: function () {
            // Copy the subjects array to avoid modifying the original array
            let subjectsArray = this.subjects ? this.subjects.slice(0) : [];

            // Filter subjects based on the search query
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                subjectsArray = subjectsArray.filter(subject => 
                    subject.title.toLowerCase().includes(query) ||  
                    subject.location.toLowerCase().includes(query)
                );
            }
            // Filter subjects based on the search query
            if (this.searchQuery) {
                // Convert search query to lowercase for case-insensitive comparison
                const query = this.searchQuery.toLowerCase();
            
                // Use filter to include only subjects that match the search query in title or location
                subjectsArray = subjectsArray.filter(subject =>
                    subject.title.toLowerCase().includes(query) ||
                    subject.location.toLowerCase().includes(query)
                );
            }
            
            // Sort subjects based on the selected sorting order
            function compareSubject(a, b) {                 //this function compares subjects, it take a & b as object parameter representing the subjects.
                const subjectA = a.title.toUpperCase();     //titles of subjects will be turned into Capslock, ensuring it is case insensitive.
                const subjectB = b.title.toUpperCase();
    
                if (subjectA > subjectB) return 1;          //If subjectA is greater than SubjectB, return 1
                if (subjectA < subjectB) return -1;         //If subjectA is less than SubjectB, return -1
                return 0;
            }
    
            function compareLocation(a, b) {                 //this function compares subjects, it take a & b as object parameter representing the location.
                const locationA = a.location.toUpperCase();  //location of subjects will be turned into Capslock, ensuring it is case insensitive.
                const locationB = b.location.toUpperCase();
    
                if (locationA > locationB) return 1;        //If subjectA is greater than SubjectB, return 1
                if (locationA < locationB) return -1;       //If subjectA is less than SubjectB, return -1
                return 0;
            }
    
            function comparePrice(a, b) {  // Comparison function for sorting objects based on their price property
                // Convert price values from strings to floating-point numbers, to allow computation between integers
                const priceA = parseFloat(a.price);
                const priceB = parseFloat(b.price);

                // Compare prices to determine their order
                if (priceA > priceB) {
                    return 1; // Positive if priceA is greater
                } else if (priceA < priceB) {
                    return -1; // Negative if priceA is smaller
                } else {
                    return 0; // Zero if prices are equal
                }
            }                            // If priceA > priceB, the result is positive; if priceA < priceB, the result is negative; if equal, result is zero.
            
    
            function compareSpaces(a, b) {  
                // return a.availableSpaces - b.availableSpaces;
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
