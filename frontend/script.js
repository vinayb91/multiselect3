class CustomSelect {
    constructor() {
        this.state = {
            selectedValues: new Set(),
            options: [],
            displayDropdown: false
        };

        this.elements = {
            selectContainer: document.getElementById('custom-select'),
            inputContainer: document.getElementById('select-input'),
            searchInput: document.getElementById('search-input'),
            dropdownElement: document.getElementById('select-dropdown'),
            optionsElement: document.getElementById('select-options'),
            breakingNewsletterCheckbox: document.getElementById('breaking-newsletter-checkbox')
        };

        // Bind methods to the instance to maintain 'this' reference
        this.fetchOptions = this.fetchOptions.bind(this);
        this.updateInputValue = this.updateInputValue.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.handleSearchInputClick = this.handleSearchInputClick.bind(this);
        this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
        this.handleSearchInputKeydown = this.handleSearchInputKeydown.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleBreakingNewsletterChange = this.handleBreakingNewsletterChange.bind(this);

        // Attach event listeners
        this.elements.searchInput.addEventListener('click', this.handleSearchInputClick);
        this.elements.searchInput.addEventListener('input', this.handleSearchInputChange);
        this.elements.searchInput.addEventListener('keydown', this.handleSearchInputKeydown);
        document.addEventListener('click', this.handleDocumentClick);
        this.elements.breakingNewsletterCheckbox.addEventListener('change', this.handleBreakingNewsletterChange);

        // Initialize the custom select
        this.init();
    }

    // Method to initialize the custom select
    async init() {
        await this.renderOptions();
        this.updateInputValue();
    }

    // Method to fetch options from the backend
    async fetchOptions(query) {
        try {
            const response = await fetch(`http://localhost:3000/api/options?search=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`Error fetching options: ${response.statusText}`);
            }
            const options = await response.json();
            return options;
        } catch (error) {
            console.error('Error fetching options:', error);
            return [];
        }
    }

    // Method to update the input value based on selected options
    updateInputValue() {
        this.elements.inputContainer.querySelectorAll('.selected-tag').forEach(tag => tag.remove());
        const selectedLabels = Array.from(this.state.selectedValues);

        selectedLabels.forEach(label => {
            const tag = document.createElement('span');
            tag.className = 'selected-tag';
            tag.textContent = label;
            tag.addEventListener('click', (event) => {
                event.stopPropagation();
                this.state.selectedValues.delete(label);
                this.updateInputValue();
                this.renderOptions(this.elements.searchInput.value);
                console.log(`selected ${Array.from(this.state.selectedValues).join(', ')}`);
            });
            this.elements.inputContainer.insertBefore(tag, this.elements.searchInput);
        });

        this.elements.searchInput.placeholder = selectedLabels.length ? '' : 'Please select or search...';
    }

    // Method to toggle the dropdown visibility
    toggleDropdown() {
        this.state.displayDropdown = !this.state.displayDropdown;
        this.elements.dropdownElement.style.display = this.state.displayDropdown ? 'block' : 'none';
        if (this.state.displayDropdown) {
            this.elements.searchInput.focus();
        }
    }

    // Method to render options based on the search query
    // Method to render options based on the search query
async renderOptions(filter = '') {
    const options = await this.fetchOptions(filter);
    this.elements.optionsElement.innerHTML = '';
    options.forEach(option => {
        const optionElement = document.createElement('li');
        optionElement.textContent = `${option.label} - ${option.value}`;
        optionElement.dataset.value = option.value;
        
        // Set state attribute for breakingNewsletter
        optionElement.state = { breakingNewsletter: option.breakingNewsletter };

        if (this.state.selectedValues.has(option.value)) {
            optionElement.classList.add('selected');
        }

        optionElement.addEventListener('click', () => {
            if (this.state.selectedValues.has(option.value)) {
                this.state.selectedValues.delete(option.value);
                optionElement.classList.remove('selected');
            } else {
                this.state.selectedValues.add(option.value);
                optionElement.classList.add('selected');
            }
            this.updateInputValue();
            this.renderOptions(this.elements.searchInput.value);
            console.log(`selected ${Array.from(this.state.selectedValues).join(', ')}`);
        });

        this.elements.optionsElement.appendChild(optionElement);
    });

    // Update the select-all checkbox state
    this.updateBreakingNewsletterCheckbox();
}


    // Method to create option element
    createOptionElement(option) {
        const optionElement = document.createElement('li');
        optionElement.textContent = option.label;
        optionElement.dataset.value = option.value;
        return optionElement;
    }

    // Method to toggle option selection
    toggleOptionSelection(option) {
        const value = option.value;
        if (this.state.selectedValues.has(value)) {
            this.state.selectedValues.delete(value);
        } else {
            this.state.selectedValues.add(value);
        }
        this.updateInputValue();
        this.renderOptions(this.elements.searchInput.value);
        console.log(`selected ${Array.from(this.state.selectedValues).join(', ')}`);
    }

    // Event handler for search input click
    handleSearchInputClick(event) {
        event.stopPropagation();
        this.toggleDropdown();
    }

    // Event handler for search input change
    handleSearchInputChange() {
        this.renderOptions(this.elements.searchInput.value);
    }

    // Event handler for search input keydown
    handleSearchInputKeydown(event) {
        if (event.key === 'Backspace' && this.elements.searchInput.value === '') {
            const lastSelected = Array.from(this.state.selectedValues).pop();
            if (lastSelected) {
                this.state.selectedValues.delete(lastSelected);
                this.updateInputValue();
                this.renderOptions();
                console.log(`selected ${Array.from(this.state.selectedValues).join(', ')}`);
            }
        }
    }

    // Event handler for document click to close the dropdown
    handleDocumentClick(event) {
        if (!this.elements.selectContainer.contains(event.target)) {
            this.elements.dropdownElement.style.display = 'none';
            this.state.displayDropdown = false;
        }
    }

    // Event handler for breaking newsletter checkbox change
    handleBreakingNewsletterChange() {
        const isChecked = this.elements.breakingNewsletterCheckbox.checked;
        const options = this.elements.optionsElement.querySelectorAll('li');

        options.forEach(option => {
            const value = option.dataset.value;
            const isBreaking = this.isBreakingNewsletter(value);

            if (isBreaking && isChecked) {
                this.state.selectedValues.add(value);
                option.classList.add('selected');
            } else if (isBreaking && !isChecked) {
                this.state.selectedValues.delete(value);
                option.classList.remove('selected');
            }
        });

        this.updateInputValue();
        console.log(`selected ${Array.from(this.state.selectedValues).join(', ')}`);
    }

    // Method to check if an option is a breaking newsletter
    isBreakingNewsletter(value) {
        // Replace with your actual logic to determine if an option is a breaking newsletter
        // For example, if the backend returns an attribute like breaking_newsletter: true
        if (value.includes('breaking_newsletter')) {
            return true; // Replace with actual logic
        }
        return false;
    }
}

// Instantiate the CustomSelect class when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CustomSelect();
});
