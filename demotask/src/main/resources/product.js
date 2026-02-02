class Product {
    constructor({id, name, price, tags, details}) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.tags = tags;
        this.details = details;
        this.updatedAt = null;
    }

    update(value) {
        if (typeof value === "string") {
            return "new-" + value;
        }
        if (typeof value === "number") {
            return value + 1;
        }
        if (Array.isArray(value)) {
            return value.map(v => this.update(v));
        }
        if (value && typeof value === "object") {
            const obj = {};
            for (const k in value) {
                obj[k] = this.update(value[k]);
            }
            return obj;
        }
        return value;
    }

    validate() {
        const errors = {};
        if (typeof this.id !== "string") {
            errors.id = "id must be a string";
        }
        if (!this.name || typeof this.name !== "string") {
            errors.name = "name must be non-empty string";
        }
        if (typeof this.price !== "number") {
            errors.price = "price must be numeric";
        }
        if (!Array.isArray(this.tags)) {
            errors.tags = "tags must be an array";
        }
        return Object.keys(errors).length > 0 ? { valid: false, errors } : { valid: true };
    }

    processUpdate() {
        const validation = this.validate();
        if (!validation.valid) {
            return { details: validation.errors };
        }

        const updatedOutput = { id: this.id };
        for (const k of ["name", "price", "tags", "details"]) {
            if (this[k] !== undefined) {
                updatedOutput[k] = this.update(this[k]);
            }
        }
        updatedOutput.updatedAt = Math.floor(Date.now() / 1000);
        return updatedOutput;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Product;
}