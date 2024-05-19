// Define a class for managing the custom select functionality
class CustomSelect {
    constructor() {
        this.selectContainer = document.getElementById('custom-select');
        this.inputContainer = document.getElementById('select-input');
        this.searchInput = document.getElementById('search-input');
        this.dropdownElement = document.getElementById('select-dropdown');
        this.optionsElement = document.getElementById('select-options');
        this.selectedValues = new Set(['a10', 'c12']);

        // Bind methods to the instance to maintain 'this' reference
        this.fetchOptions = this.fetchOptions.bind(this);
        this.updateInputValue = this.updateInputValue.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.handleSearchInputClick = this.handleSearchInputClick.bind(this);
        this.handleSearchInputChange = this.handleSearchInputChange.bind(this);
        this.handleSearchInputKeydown = this.handleSearchInputKeydown.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);

        // Attach event listeners
        this.searchInput.addEventListener('click', this.handleSearchInputClick);
        this.searchInput.addEventListener('input', this.handleSearchInputChange);
        this.searchInput.addEventListener('keydown', this.handleSearchInputKeydown);
        document.addEventListener('click', this.handleDocumentClick);

        // Initialize the custom select
        this.updateInputValue();
        this.renderOptions();
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
        this.inputContainer.querySelectorAll('.selected-tag').forEach(tag => tag.remove());
        const selectedLabels = Array.from(this.selectedValues);

        selectedLabels.forEach(label => {
            const tag = document.createElement('span');
            tag.className = 'selected-tag';
            tag.textContent = label;
            tag.addEventListener('click', (event) => {
                event.stopPropagation();
                this.selectedValues.delete(label);
                this.updateInputValue();
                this.renderOptions(this.searchInput.value);
                console.log(`selected ${Array.from(this.selectedValues).join(', ')}`);
            });
            this.inputContainer.insertBefore(tag, this.searchInput);
        });

        this.searchInput.placeholder = selectedLabels.length ? '' : 'Please select or search...';
    }

    // Method to toggle the dropdown visibility
    toggleDropdown() {
        const display = this.dropdownElement.style.display === 'block' ? 'none' : 'block';
        this.dropdownElement.style.display = display;
        if (display === 'block') {
            this.searchInput.focus();
            this.renderOptions();
        }
    }

    // Method to render options based on the search query
    async renderOptions(filter = '') {
        const options = await this.fetchOptions(filter);
        this.optionsElement.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('li');
            optionElement.textContent = option.label;
            optionElement.dataset.value = option.value;

            if (this.selectedValues.has(option.value)) {
                optionElement.classList.add('selected');
            }

            optionElement.addEventListener('click', () => {
                if (this.selectedValues.has(option.value)) {
                    this.selectedValues.delete(option.value);
                    optionElement.classList.remove('selected');
                } else {
                    this.selectedValues.add(option.value);
                    optionElement.classList.add('selected');
                }
                this.updateInputValue();
                this.renderOptions(this.searchInput.value);
                console.log(`selected ${Array.from(this.selectedValues).join(', ')}`);
            });

            this.optionsElement.appendChild(optionElement);
        });
    }

    // Event handler for search input click
    handleSearchInputClick(event) {
        event.stopPropagation();
        this.toggleDropdown();
    }

    // Event handler for search input change
    handleSearchInputChange() {
        this.renderOptions(this.searchInput.value);
    }

    // Event handler for search input keydown
    handleSearchInputKeydown(event) {
        if (event.key === 'Backspace' && this.searchInput.value === '') {
            const lastSelected = Array.from(this.selectedValues).pop();
            if (lastSelected) {
                this.selectedValues.delete(lastSelected);
                this.updateInputValue();
                this.renderOptions();
                console.log(`selected ${Array.from(this.selectedValues).join(', ')}`);
            }
        }
    }

    // Event handler for document click to close the dropdown
    handleDocumentClick(event) {
        if (!this.selectContainer.contains(event.target)) {
            this.dropdownElement.style.display = 'none';
        }
    }
}

// Instantiate the CustomSelect class when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CustomSelect();
});
