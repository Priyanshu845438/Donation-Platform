const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        minlength: [2, 'Company name must be at least 2 characters'],
        maxlength: [200, 'Company name cannot exceed 200 characters'],
        index: true
    },
    companyEmail: {
        type: String,
        required: [true, 'Company email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    companyPhoneNumber: {
        type: String,
        required: [true, 'Company phone number is required'],
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        trim: true,
        maxlength: [50, 'Registration number cannot exceed 50 characters'],
        index: true
    },
    companyAddress: {
        street: {
            type: String,
            default: '',
            maxlength: [200, 'Street address cannot exceed 200 characters']
        },
        city: {
            type: String,
            default: '',
            maxlength: [100, 'City cannot exceed 100 characters']
        },
        state: {
            type: String,
            default: '',
            maxlength: [100, 'State cannot exceed 100 characters']
        },
        postalCode: {
            type: String,
            default: '',
            maxlength: [20, 'Postal code cannot exceed 20 characters']
        },
        country: {
            type: String,
            default: 'India',
            maxlength: [100, 'Country cannot exceed 100 characters']
        }
    },
    ceoName: {
        type: String,
        default: 'Not provided',
        trim: true,
        maxlength: [100, 'CEO name cannot exceed 100 characters']
    },
    ceoContactNumber: {
        type: String,
        default: 'Not provided',
        trim: true,
        validate: {
            validator: function(v) {
                return v === 'Not provided' || /^[0-9+\-\s()]{7,15}$/.test(v);
            },
            message: 'Please provide a valid phone number format'
        }
    },
    ceoEmail: {
        type: String,
        default: 'Not provided',
        trim: true,
        lowercase: true,
        validate: {
            validator: function(email) {
                if (email === 'not provided' || email === '') return true;
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: 'Please provide a valid email format'
        }
    },
    companyType: {
        type: String,
        required: [true, 'Company type is required'],
        enum: {
            values: ['IT', 'Manufacturing', 'Healthcare', 'Education', 'Finance', 'Retail', 'Construction', 'Agriculture', 'Other'],
            message: 'Invalid company type'
        },
        default: 'Other',
        index: true
    },
    numberOfEmployees: {
        type: Number,
        default: 1,
        min: [1, 'Number of employees must be at least 1'],
        max: [1000000, 'Number of employees cannot exceed 1,000,000']
    },
    companyLogo: {
        type: String,
        default: '',
        maxlength: [500, 'Logo URL cannot exceed 500 characters']
    },
    website: {
        type: String,
        default: '',
        trim: true,
        validate: {
            validator: function(url) {
                if (!url || url === '') return true;
                return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url);
            },
            message: 'Please provide a valid website URL'
        }
    },
    taxId: {
        type: String,
        default: '',
        trim: true,
        maxlength: [50, 'Tax ID cannot exceed 50 characters']
    },
    gstNumber: {
        type: String,
        default: '',
        trim: true,
        maxlength: [20, 'GST number cannot exceed 20 characters']
    },
    panNumber: {
        type: String,
        default: '',
        trim: true,
        maxlength: [20, 'PAN number cannot exceed 20 characters']
    },
    bankDetails: {
        accountHolderName: {
            type: String,
            default: 'Not provided',
            trim: true,
            maxlength: [100, 'Account holder name cannot exceed 100 characters']
        },
        accountNumber: {
            type: String,
            default: 'Not provided',
            trim: true,
            maxlength: [30, 'Account number cannot exceed 30 characters']
        },
        ifscCode: {
            type: String,
            default: 'Not provided',
            trim: true,
            maxlength: [15, 'IFSC code cannot exceed 15 characters']
        },
        bankName: {
            type: String,
            default: 'Not provided',
            trim: true,
            maxlength: [100, 'Bank name cannot exceed 100 characters']
        },
        branchName: {
            type: String,
            default: 'Not provided',
            trim: true,
            maxlength: [100, 'Branch name cannot exceed 100 characters']
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    verificationDate: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    socialMediaLinks: {
        linkedin: {
            type: String,
            default: '',
            trim: true
        },
        twitter: {
            type: String,
            default: '',
            trim: true
        },
        facebook: {
            type: String,
            default: '',
            trim: true
        },
        instagram: {
            type: String,
            default: '',
            trim: true
        }
    },
    industry: {
        type: String,
        default: 'Other',
        maxlength: [100, 'Industry cannot exceed 100 characters']
    },
    foundedYear: {
        type: Number,
        min: [1800, 'Founded year cannot be before 1800'],
        max: [new Date().getFullYear(), 'Founded year cannot be in the future']
    },
    description: {
        type: String,
        default: '',
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    totalDonations: {
        type: Number,
        default: 0,
        min: [0, 'Total donations cannot be negative']
    },
    donationCount: {
        type: Number,
        default: 0,
        min: [0, 'Donation count cannot be negative']
    },
    lastDonationDate: {
        type: Date
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    ratingCount: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative']
    }
}, {
    timestamps: true
});

// Indexes for better query performance
companySchema.index({ companyName: 1, isActive: 1 });
companySchema.index({ companyType: 1, isActive: 1 });
companySchema.index({ totalDonations: -1 });
companySchema.index({ createdAt: -1 });
// CompanyEmail uniqueness handled by schema definition

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
    const address = this.companyAddress;
    const parts = [address.street, address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part && part !== '').join(', ');
});

// Virtual for company size category
companySchema.virtual('companySizeCategory').get(function() {
    if (this.numberOfEmployees <= 10) return 'Startup';
    if (this.numberOfEmployees <= 50) return 'Small';
    if (this.numberOfEmployees <= 250) return 'Medium';
    if (this.numberOfEmployees <= 1000) return 'Large';
    return 'Enterprise';
});

// Virtual for years in business
companySchema.virtual('yearsInBusiness').get(function() {
    if (!this.foundedYear) return null;
    return new Date().getFullYear() - this.foundedYear;
});

// Method to update donation stats
companySchema.methods.updateDonationStats = async function(amount) {
    this.totalDonations += amount;
    this.donationCount += 1;
    this.lastDonationDate = new Date();
    await this.save();
};

// Method to add rating
companySchema.methods.addRating = async function(rating) {
    const newTotal = (this.rating * this.ratingCount) + rating;
    this.ratingCount += 1;
    this.rating = newTotal / this.ratingCount;
    await this.save();
};

// Method to verify company
companySchema.methods.verify = async function(verifiedBy) {
    this.isVerified = true;
    this.verificationDate = new Date();
    this.verifiedBy = verifiedBy;
    await this.save();
};

// Static method to get top donors
companySchema.statics.getTopDonors = async function(limit = 10) {
    return await this.find({ isActive: true })
        .sort({ totalDonations: -1 })
        .limit(limit)
        .populate('userId', 'fullName email');
};

// Static method to get companies by type
companySchema.statics.getCompaniesByType = async function(type, limit = 10) {
    return await this.find({ companyType: type, isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'fullName email');
};

// Pre-save middleware to ensure email uniqueness
companySchema.pre('save', async function(next) {
    if (this.isModified('companyEmail')) {
        const existingCompany = await this.constructor.findOne({
            companyEmail: this.companyEmail,
            _id: { $ne: this._id }
        });
        if (existingCompany) {
            throw new Error('Company email already exists');
        }
    }
    next();
});

module.exports = mongoose.model('Company', companySchema);
