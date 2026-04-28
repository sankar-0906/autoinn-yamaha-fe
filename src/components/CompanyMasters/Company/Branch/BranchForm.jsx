import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import LocationStep from './LocationStep';

const BranchForm = ({ open, close, data, editable, emitData }) => {
    const [formData, setFormData] = useState({});
    const [locationForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [deletedContacts, setDeletedContacts] = useState([]);
    const [currentContacts, setCurrentContacts] = useState(data?.contacts || []);

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
                gst: data.gst || '',
                lat: data.lat || '',
                lon: data.lon || '',
                email: data.email || '',
                url: data.url || '',
                googleMapUrl: data.googleMapUrl || ''
            };
            setFormData(initialData);
            setCurrentContacts(data.contacts || []);
        } else {
            setFormData({
                contacts: [],
                gst: '',
                lat: '',
                lon: '',
                email: '',
                url: '',
                googleMapUrl: ''
            });
            setCurrentContacts([]);
        }
    }, [data, open]);

    const handleContactsChange = useCallback((contacts) => {
        setCurrentContacts(contacts);
    }, []);

    const validateLocationStep = async () => {
        try {
            const values = await locationForm.validateFields();

            if (!currentContacts || currentContacts.length === 0) {
                message.error("Please add at least one contact");
                return false;
            }

            if (values.lat && (isNaN(values.lat) || values.lat < -90 || values.lat > 90)) {
                message.error("Invalid latitude value");
                return false;
            }

            if (values.lon && (isNaN(values.lon) || values.lon < -180 || values.lon > 180)) {
                message.error("Invalid longitude value");
                return false;
            }

            setFormData(prev => ({
                ...prev,
                ...values,
                contacts: currentContacts
            }));

            return true;
        } catch (error) {
            console.error("Location validation failed:", error);
            message.error("Please fill all required fields correctly");
            return false;
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const isValid = await validateLocationStep();
            if (!isValid) {
                setLoading(false);
                return;
            }

            // After validation, formData should be updated but we might need values directly from form
            const values = locationForm.getFieldsValue();

            const finalData = {
                name: values.name,
                address: values.address,
                gst: values.gst,
                lat: values.lat,
                lon: values.lon,
                manufacturer: values.manufacturer,
                personInCharge: values.personInCharge,
                email: values.email,
                url: values.url,
                googleMapUrl: values.googleMapUrl,
                contacts: currentContacts.map(contact => {
                    const cleanContact = {
                        phone: contact.phone,
                        category: contact.category
                    };
                    if (contact.id && !contact.id.startsWith('temp_')) {
                        cleanContact.id = contact.id;
                    }
                    return cleanContact;
                })
            };

            if (!finalData.name) {
                message.error("Enter branch name");
                setLoading(false);
                return;
            }

            if (!finalData.address?.line1) {
                message.error("Enter address line 1");
                setLoading(false);
                return;
            }

            if (!finalData.address?.locality) {
                message.error("Enter locality");
                setLoading(false);
                return;
            }

            if (!finalData.address?.country) {
                message.error("Select country");
                setLoading(false);
                return;
            }

            if (!finalData.address?.state) {
                message.error("Select state");
                setLoading(false);
                return;
            }

            if (!finalData.address?.district) {
                message.error("Select city");
                setLoading(false);
                return;
            }

            if (!finalData.address?.pincode) {
                message.error("Enter pincode");
                setLoading(false);
                return;
            }

            if (!finalData.contacts || finalData.contacts.length === 0) {
                message.error("Add at least one contact");
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

    const handleCancel = () => {
        setFormData({
            contacts: []
        });
        setDeletedContacts([]);
        locationForm.resetFields();
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
                <Button key="back" onClick={handleCancel}>
                    Cancel
                </Button>,
                editable ? (
                    <Button key="save" type="primary" onClick={handleSave} loading={loading}>
                        Save
                    </Button>
                ) : (
                    <Button key="close" type="primary" onClick={handleCancel}>
                        Close
                    </Button>
                )
            ]}
        >
            <div className="steps-content" style={{ minHeight: '400px', marginTop: '24px' }}>
                <LocationStep
                    form={locationForm}
                    data={formData}
                    setData={setFormData}
                    editable={editable}
                    onContactsChange={handleContactsChange}
                    deletedContacts={deletedContacts}
                    setDeletedContacts={setDeletedContacts}
                />
            </div>
        </Modal>
    );
};

export default BranchForm;
