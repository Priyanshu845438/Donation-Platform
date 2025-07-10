const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    ngoName: {
        type: String,
        required: [true, 'NGO name is required'],
        trim: true,
        minlength: [2, 'NGO name must be at least 2 characters'],
        maxlength: [200, 'NGO name cannot exceed 200 characters'],
        index: true
    },
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        trim: true,
        maxlength: [50, 'Registration number cannot exceed 50 characters'],
        index: true
    },
    registeredYear: {
        type: Number,
        required: [true, 'Registered year is required'],
        min: [1800, 'Registered year cannot be before 1800'],
        max: [new Date().getFullYear(), 'Registered year cannot be in the future']
    },
    address: {
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
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
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
    authorizedPerson: {
        name: {
            type: String,
            default: 'Not provided',
            trim: true,
            maxlength: [100, 'Authorized person name cannot exceed 100 characters']
        },
        phone: {
            type: String,
            default: 'Not provided',
            trim: true,
            match: [/^[0-9+\-\s()]*$/, 'Please provide a valid phone number format']
        },
        email: {
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
        designation: {
            type: String,
            default: 'Director',
            trim: true,
            maxlength: [100, 'Designation cannot exceed 100 characters']
        }
    },
    panNumber: {
        type: String,
        default: 'Not provided',
        trim: true,
        maxlength: [20, 'PAN number cannot exceed 20 characters']
    },
    tanNumber: {
        type: String,
        default: 'Not provided',
        trim: true,
        maxlength: [20, 'TAN number cannot exceed 20 characters']
    },
    gstNumber: {
        type: String,
        default: 'Not provided',
        trim: true,
        maxlength: [20, 'GST number cannot exceed 20 characters']
    },
    numberOfEmployees: {
        type: Number,
        default: 1,
        min: [1, 'Number of employees must be at least 1'],
        max: [100000, 'Number of employees cannot exceed 100,000']
    },
    ngoType: {
        type: String,
        required: [true, 'NGO type is required'],
        enum: {
            values: ['Trust', 'Society', 'Section 8 Company', 'Partnership', 'Other'],
            message: 'Invalid NGO type'
        },
        default: 'Trust',
        index: true
    },
    is80GCertified: {
        type: Boolean,
        default: false,
        index: true
    },
    is12ACertified: {
        type: Boolean,
        default: false,
        index: true
    },
    fcraRegistered: {
        type: Boolean,
        default: false,
        index: true
    },
    fcraNumber: {
        type: String,
        default: '',
        trim: true,
        maxlength: [30, 'FCRA number cannot exceed 30 characters']
    },
    certifications: [{
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Certification name cannot exceed 100 characters']
        },
        issuedBy: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Issuing authority cannot exceed 100 characters']
        },
        issuedDate: {
            type: Date,
            required: true
        },
        expiryDate: {
            type: Date
        },
        certificateUrl: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
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
        },
        accountType: {
            type: String,
            default: 'Current',
            enum: ['Savings', 'Current', 'Other']
        }
    },
    workingAreas: [{
        type: String,
        enum: ['Education', 'Healthcare', 'Environment', 'Poverty Alleviation', 'Women Empowerment', 'Child Welfare', 'Disaster Relief', 'Animal Welfare', 'Rural Development', 'Other']
    }],
    targetBeneficiaries: [{
        type: String,
        enum: ['Children', 'Women', 'Elderly', 'Disabled', 'Poor', 'Students', 'Farmers', 'Workers', 'All', 'Other']
    }],
    logo: {
        type: String,
        default: '',
        maxlength: [500, 'Logo URL cannot exceed 500 characters']
    },
    documents: [{
        type: {
            type: String,
            required: true,
            enum: ['registration_certificate', 'tax_exemption', 'audit_report', 'annual_report', 'other']
        },
        name: {
            type: String,
            required: true,
            maxlength: [100, 'Document name cannot exceed 100 characters']
        },
        url: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        expiryDate: {
            type: Date
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    }],
    socialMediaLinks: {
        facebook: {
            type: String,
            default: '',
            trim: true
        },
        twitter: {
            type: String,
            default: '',
            trim: true
        },
        instagram: {
            type: String,
            default: '',
            trim: true
        },
        linkedin: {
            type: String,
            default: '',
            trim: true
        },
        youtube: {
            type: String,
            default: '',
            trim: true
        }
    },
    description: {
        type: String,
        default: '',
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    mission: {
        type: String,
        default: '',
        maxlength: [1000, 'Mission statement cannot exceed 1000 characters']
    },
    vision: {
        type: String,
        default: '',
        maxlength: [1000, 'Vision statement cannot exceed 1000 characters']
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
    verificationDocuments: [{
        type: String
    }],
    totalFundsReceived: {
        type: Number,
        default: 0,
        min: [0, 'Total funds received cannot be negative']
    },
    totalCampaigns: {
        type: Number,
        default: 0,
        min: [0, 'Total campaigns cannot be negative']
    },
    activeCampaigns: {
        type: Number,
        default: 0,
        min: [0, 'Active campaigns cannot be negative']
    },
    successfulCampaigns: {
        type: Number,
        default: 0,
        min: [0, 'Successful campaigns cannot be negative']
    },
    totalDonors: {
        type: Number,
        default: 0,
        min: [0, 'Total donors cannot be negative']
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
    },
    lastActivityDate: {
        type: Date,
        default: Date.now
    },
    establishedIn: {
        type: String,
        default: '',
        maxlength: [100, 'Established location cannot exceed 100 characters']
    }
}, {
    timestamps: true
});

// Indexes for better query performance
ngoSchema.index({ ngoName: 1, isActive: 1 });
ngoSchema.index({ ngoType: 1, isActive: 1 });
ngoSchema.index({ workingAreas: 1, isActive: 1 });
ngoSchema.index({ is80GCertified: 1, isActive: 1 });
ngoSchema.index({ totalFundsReceived: -1 });
ngoSchema.index({ rating: -1 });
ngoSchema.index({ createdAt: -1 });
// Email uniqueness handled by schema definition

// Virtual for full address
ngoSchema.virtual('fullAddress').get(function() {
    const address = this.address;
    const parts = [address.street, address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part && part !== '').join(', ');
});

// Virtual for years of operation
ngoSchema.virtual('yearsOfOperation').get(function() {
    return new Date().getFullYear() - this.registeredYear;
});

// Virtual for success rate
ngoSchema.virtual('successRate').get(function() {
    if (this.totalCampaigns === 0) return 0;
    return ((this.successfulCampaigns / this.totalCampaigns) * 100).toFixed(2);
});

// Virtual for average donation per campaign
ngoSchema.virtual('averageFundsPerCampaign').get(function() {
    if (this.totalCampaigns === 0) return 0;
    return (this.totalFundsReceived / this.totalCampaigns).toFixed(2);
});

// Virtual for certification status
ngoSchema.virtual('certificationStatus').get(function() {
    const certifications = [];
    if (this.is80GCertified) certifications.push('80G');
    if (this.is12ACertified) certifications.push('12A');
    if (this.fcraRegistered) certifications.push('FCRA');
    return certifications.length > 0 ? certifications.join(', ') : 'None';
});

// Method to update campaign stats
ngoSchema.methods.updateCampaignStats = async function(type, amount = 0) {
    switch (type) {
        case 'created':
            this.totalCampaigns += 1;
            this.activeCampaigns += 1;
            break;
        case 'completed':
            this.activeCampaigns -= 1;
            this.successfulCampaigns += 1;
            break;
        case 'cancelled':
            this.activeCampaigns -= 1;
            break;
        case 'donation':
            this.totalFundsReceived += amount;
            break;
    }
    
    this.lastActivityDate = new Date();
    await this.save();
};

// Method to add rating
ngoSchema.methods.addRating = async function(rating) {
    const newTotal = (this.rating * this.ratingCount) + rating;
    this.ratingCount += 1;
    this.rating = newTotal / this.ratingCount;
    await this.save();
};

// Method to verify NGO
ngoSchema.methods.verify = async function(verifiedBy, documents = []) {
    this.isVerified = true;
    this.verificationDate = new Date();
    this.verifiedBy = verifiedBy;
    this.verificationDocuments = documents;
    await this.save();
};

// Method to add certification
ngoSchema.methods.addCertification = async function(certification) {
    this.certifications.push({
        ...certification,
        isActive: true
    });
    await this.save();
};

// Method to update donor count
ngoSchema.methods.updateDonorCount = async function(newDonorCount) {
    this.totalDonors = newDonorCount;
    await this.save();
};

// Static method to get top NGOs by funds raised
ngoSchema.statics.getTopNGOs = async function(limit = 10) {
    return await this.find({ isActive: true, isVerified: true })
        .sort({ totalFundsReceived: -1 })
        .limit(limit)
        .populate('userId', 'fullName email');
};

// Static method to get NGOs by working area
ngoSchema.statics.getNGOsByWorkingArea = async function(workingArea, limit = 10) {
    return await this.find({ 
        workingAreas: workingArea, 
        isActive: true,
        isVerified: true 
    })
        .sort({ rating: -1, totalFundsReceived: -1 })
        .limit(limit)
        .populate('userId', 'fullName email');
};

// Static method to get certified NGOs
ngoSchema.statics.getCertifiedNGOs = async function(certificationType = '80G', limit = 10) {
    const query = { isActive: true };
    
    switch (certificationType) {
        case '80G':
            query.is80GCertified = true;
            break;
        case '12A':
            query.is12ACertified = true;
            break;
        case 'FCRA':
            query.fcraRegistered = true;
            break;
    }
    
    return await this.find(query)
        .sort({ rating: -1, totalFundsReceived: -1 })
        .limit(limit)
        .populate('userId', 'fullName email');
};

// Static method to search NGOs
ngoSchema.statics.searchNGOs = async function(searchQuery, filters = {}, page = 1, limit = 10) {
    const query = {
        isActive: true,
        ...filters
    };
    
    if (searchQuery) {
        query.$or = [
            { ngoName: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { workingAreas: { $in: [new RegExp(searchQuery, 'i')] } },
            { targetBeneficiaries: { $in: [new RegExp(searchQuery, 'i')] } }
        ];
    }
    
    const skip = (page - 1) * limit;
    
    const [ngos, total] = await Promise.all([
        this.find(query)
            .populate('userId', 'fullName email')
            .sort({ rating: -1, totalFundsReceived: -1 })
            .skip(skip)
            .limit(limit),
        this.countDocuments(query)
    ]);
    
    return {
        ngos,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

// Pre-save middleware to ensure email uniqueness
ngoSchema.pre('save', async function(next) {
    if (this.isModified('email')) {
        const existingNGO = await this.constructor.findOne({
            email: this.email,
            _id: { $ne: this._id }
        });
        if (existingNGO) {
            throw new Error('NGO email already exists');
        }
    }
    next();
});

module.exports = mongoose.model('NGO', ngoSchema);
