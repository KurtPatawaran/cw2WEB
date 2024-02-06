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
        subjects: subjects || [],
        cart: [],
        sortOrder: '',
        searchQuery: '',
    },

    // Methods for handling user interactions and actions
    methods: {
        addToCart: function (subject) {
            this.cart.push(subject.id);
        },

        showCheckout1() {
            // Toggle between showing subjects and the cart for checkout
            if (this.cart.length > 0) {
                this.showSubject = !this.showSubject;
            } else {
                alert('Add a lesson to the cart to proceed to checkout.');
            }
        },

        showCheckout2() {
            // Toggle between showing subjects and the cart when returning from checkout
            this.showSubject = !this.showSubject;
        },

        submitForm() {
            // Submit the order after validating details
            if (!this.order.firstName || !this.order.lastName || !this.order.contactNum) {
                alert('Please enter all required details before placing the order.');
            } else {
                alert('You Have Successfully Applied :D');
                this.cart.length = 0;
                this.order.firstName = '';
                this.order.lastName = '';
                this.order.contactNum = '';
                this.showSubject = !this.showSubject;
            }
        },

        cartCount(id) {
            // Count occurrences of a subject in the cart
            let count = 0;
            for (let i = 0; i < this.cart.length; i++) {
                if (this.cart[i] === id) {
                    count++;
                }
            }
            return count;
        },

        canAddToCart: function (subject) {
            // Check if a subject can be added to the cart
            return subject.availableSpaces > this.cartCount(subject.id);
        },

        // Remove a subject from the cart based on its ID
        removeFromCart(id) {
            // Find the index of the subject with the given ID in the cart
            const index = this.cart.indexOf(id);

            // Check if the subject is in the cart
            if (index !== -1) {
                // Remove the subject from the cart using splice
                this.cart.splice(index, 1);

                // If the cart is empty after removal, bring the user back to the subject page
                if (this.cart.length === 0) {
                    this.showSubject = !this.showSubject;
                }
            }
        },

        getSubjectById(id) {
            // Get a subject by its ID
            return this.subjects.find(subject => subject.id === id);
        },

        sortSubjects: function (order) {
            // Set the sorting order for subjects
            this.sortOrder = order;
        },

        clearSearch(){
            // Clear the search query
            this.searchQuery= '';
        }
    },

    // Computed properties for dynamic data calculations and filtering
    computed: {
        filteredSubjects: function () {
            // Copy the subjects array to avoid modifying the original array
            let subjectsArray = this.subjects.slice(0);

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
