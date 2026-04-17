import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Steps, Button, Form, message } from 'antd';
import { HomeOutlined, BankOutlined } from '@ant-design/icons';
import LocationStep from './LocationStep';
import BankStep from './BankStep';

const { Step } = Steps;

const BranchForm = ({ open, close, data, editable, emitData }) => {
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState({});
    const [locationForm] = Form.useForm();
    const [bankForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [bankValidationPassed, setBankValidationPassed] = useState(true);
    const [deletedContacts, setDeletedContacts] = useState([]);
    const [deletedBanks, setDeletedBanks] = useState([]);
    const [currentContacts, setCurrentContacts] = useState(data?.contacts || []); // Autoinn-style

    useEffect(() => {
        if (data) {
            // Flatten nested data for form initialization
            const initialData = {
                ...data,
                address: data.address ? {
                    ...data.address,
                    district: data.address.cityId || data.address.district?.id,
                    state: data.address.stateId || data.address.state?.id,
                    country: data.address.countryId || data.address.country?.id,
                    line3: data.address.line3 || '',
                } : {},
                manufacturer: data.manufacturer?.map(m => m.id) || [],
                personInCharge: data.personInCharge?.map(p => p.id) || [],
                contacts: data.contacts || [],
                bankDetails: data.bankDetails || [],
                gst: data.gst || '',
                lat: data.lat || '',
                lon: data.lon || '',
                email: data.email || '',
                url: data.url || '',
                googleMapUrl: data.googleMapUrl || '',
                noOfRamps: data.noOfRamps || 0
            };
            setFormData(initialData);
            setCurrentContacts(data.contacts || []); // Update contacts when data changes
        } else {
            setFormData({
                contacts: [],
                bankDetails: [], // Start with empty array, let user add banks if needed
                gst: '',
                lat: '',
                lon: '',
                email: '',
                url: '',
                googleMapUrl: '',
                noOfRamps: 0
            });
            setCurrentContacts([]); // Reset contacts for new branch
        }
    }, [data, open]);

    // Autoinn-style: Handle contacts change from LocationStep
    const handleContactsChange = useCallback((contacts) => {
        setCurrentContacts(contacts);
    }, []);
    
    const validateLocationStep = async () => {
        try {
            const values = await locationForm.validateFields();
            
            // Autoinn-style validation like autoinn's handleNext
            if (!currentContacts || currentContacts.length === 0) {
                message.error("Please add at least one contact");
                return false;
            }
            
            // Check GST validation
            if (values.gst && values.gst.length === 15) {
                // GST validation is handled in LocationStep component
            }
            
            // Validate coordinates
            if (values.lat && (isNaN(values.lat) || values.lat < -90 || values.lat > 90)) {
                message.error("Invalid latitude value");
                return false;
            }
            
            if (values.lon && (isNaN(values.lon) || values.lon < -180 || values.lon > 180)) {
                message.error("Invalid longitude value");
                return false;
            }
            
            // Autoinn-style: Merge data like autoinn's handleNext
            setFormData(prev => ({ 
                ...prev, 
                ...values,
                // Use currentContacts from LocationStep like autoinn
                contacts: currentContacts,
                bankDetails: prev.bankDetails || []
            }));
            
            return true;
        } catch (error) {
            console.error("Location step validation failed:", error);
            message.error("Please fill all required fields correctly");
            return false;
        }
    };

    const next = async () => {
        if (current === 0) {
            const isValid = await validateLocationStep();
            if (isValid) {
                setCurrent(current + 1);
            }
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Validate bank step if we're on bank step
            if (current === 1) {
                // Bank validation is handled by BankStep component
                if (!bankValidationPassed) {
                    message.error("Please fix bank account errors before saving");
                    setLoading(false);
                    return;
                }
            }
            
            // Prepare final data - autoinn style
            const finalData = { 
                name: formData.name,
                branchType: formData.branchType,
                address: formData.address,
                gst: formData.gst,
                lat: formData.lat,
                lon: formData.lon,
                manufacturer: formData.manufacturer,
                personInCharge: formData.personInCharge,
                email: formData.email,
                url: formData.url,
                googleMapUrl: formData.googleMapUrl,
                noOfRamps: formData.noOfRamps || 0,
                // Autoinn-style: Use currentContacts and generate proper IDs
                contacts: currentContacts.map((contact, index) => {
                    // Clean contact object - only send allowed fields
                    const cleanContact = {
                        phone: contact.phone,
                        category: contact.category
                    };
                    // Only include ID if it exists and is not a temp ID
                    if (contact.id && !contact.id.startsWith('temp_')) {
                        cleanContact.id = contact.id;
                    }
                    return cleanContact;
                }),
                // Handle bank details - allow empty array for new branches
                bankDetails: (formData.bankDetails || []).filter(bank => 
                    bank.name && bank.accountName && bank.accountNumber && bank.ifsc && bank.accountType
                ).map((bank, index) => {
                    // Clean bank object - only send allowed fields
                    const cleanBank = {
                        name: bank.name,
                        accountName: bank.accountName,
                        accountNumber: bank.accountNumber,
                        ifsc: bank.ifsc,
                        accountType: bank.accountType || 'SAVINGS' // Add accountType with default
                    };
                    // Only include ID if it exists and is not a temp ID
                    if (bank.id && !bank.id.startsWith('temp_')) {
                        cleanBank.id = bank.id;
                    }
                    return cleanBank;
                })
            };
            
            // Validate required fields one more time
            if (!finalData.name) {
                message.error("Branch name is required");
                setLoading(false);
                return;
            }
            
            if (!finalData.branchType) {
                message.error("Branch type is required");
                setLoading(false);
                return;
            }
            
            if (!finalData.address?.line1) {
                message.error("Address line 1 is required");
                setLoading(false);
                return;
            }
            
            if (!finalData.address?.locality) {
                message.error("Locality is required");
                setLoading(false);
                return;
            }
            
            if (!finalData.address?.country) {
                message.error("Country is required");
                setLoading(false);
                return;
            }
            
            if (!finalData.address?.state) {
                message.error("State is required");
                setLoading(false);
                return;
            }
            
            if (!finalData.address?.district) {
                message.error("City is required");
                setLoading(false);
                return;
            }
            
            if (!finalData.address?.pincode) {
                message.error("Pincode is required");
                setLoading(false);
                return;
            }
            
            // GST is optional for now
            // if (!finalData.gst) {
            //     message.error("GSTIN is required");
            //     setLoading(false);
            //     return;
            // }
            
            // Lat/Lon are optional for now
            // if (!finalData.lat) {
            //     message.error("Latitude is required");
            //     setLoading(false);
            //     return;
            // }
            
            // if (!finalData.lon) {
            //     message.error("Longitude is required");
            //     setLoading(false);
            //     return;
            // }

            // Check if contacts exist
            if (!finalData.contacts || finalData.contacts.length === 0) {
                message.error("At least one contact is required");
                setLoading(false);
                return;
            }

            const success = await emitData(finalData, data?.id);
            if (success) {
                message.success(data ? "Branch updated successfully" : "Branch created successfully");
                close();
            }
        } catch (error) {
            console.error("Save failed:", error);
            message.error("Failed to save branch. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Location Data',
            icon: <HomeOutlined />,
            content: (
                <LocationStep 
                    form={locationForm} 
                    data={formData} 
                    setData={setFormData} 
                    editable={editable}
                    onContactsChange={handleContactsChange}
                    deletedContacts={deletedContacts}
                    setDeletedContacts={setDeletedContacts}
                />
            )
        },
        {
            title: 'Bank Data',
            icon: <BankOutlined />,
            content: (
                <BankStep 
                    form={bankForm} 
                    data={{
                        ...formData,
                        onValidate: (validationResult) => setBankValidationPassed(validationResult)
                    }} 
                    setData={setFormData} 
                    editable={editable}
                    deletedBanks={deletedBanks}
                    setDeletedBanks={setDeletedBanks}
                />
            )
        }
    ];

    const handleCancel = () => {
        // Reset form state
        setCurrent(0);
        setFormData({
            contacts: [],
            bankDetails: [{
                id: '',
                name: '',
                accountName: '',
                accountNumber: '',
                ifsc: '',
                accountType: 'SAVINGS',
                accountBalance: 0
            }]
        });
        setDeletedContacts([]);
        setDeletedBanks([]);
        setBankValidationPassed(true);
        locationForm.resetFields();
        bankForm.resetFields();
        close();
    };

    return (
        <Modal
            title={data ? (editable ? "Modify Branch" : "View Branch") : "Add Branch"}
            open={open}
            onCancel={handleCancel}
            width={1000}
            destroyOnHidden={true}
            footer={[
                <Button 
                    key="back" 
                    onClick={current === 0 ? handleCancel : () => setCurrent(current - 1)}
                >
                    {current === 0 ? "Cancel" : "Previous"}
                </Button>,
                current < steps.length - 1 ? (
                    <Button key="next" type="primary" onClick={next}>
                        Next
                    </Button>
                ) : (
                    editable ? (
                        <Button 
                            key="save" 
                            type="primary" 
                            onClick={handleSave} 
                            loading={loading}
                            disabled={!bankValidationPassed}
                        >
                            Save
                        </Button>
                    ) : (
                        <Button key="close" type="primary" onClick={handleCancel}>
                            Close
                        </Button>
                    )
                )
            ]}
        >
            <Steps current={current} style={{ marginBottom: '24px' }}>
                {steps.map(item => (
                    <Step key={item.title} title={item.title} icon={item.icon} />
                ))}
            </Steps>
            <div className="steps-content" style={{ minHeight: '400px' }}>
                {steps[current].content}
            </div>
        </Modal>
    );
};

export default BranchForm;
