import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button, Card, Empty, Pagination, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { getManufacturers } from '../../api/manufacturer';
import styles from './VehicleMaster.module.css';

const { Title } = Typography;
const { Option } = Select;

interface VehicleImage {
    id?: string;
    color: string;
    code: string;
    url?: string;
}

interface VehicleMasterModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    readOnly?: boolean;
}

const VehicleMasterModal: React.FC<VehicleMasterModalProps> = ({ open, onClose, onSave, initialValues, loading, readOnly }) => {
    const [form] = Form.useForm();
    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [images, setImages] = useState<VehicleImage[]>([]);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [editingImage, setEditingImage] = useState<{ index: number; image: VehicleImage } | null>(null);
    const [imageForm] = Form.useForm();
    const [currentImagePage, setCurrentImagePage] = useState(1);
    const imagesPerPage = 1;

    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                const res = await getManufacturers();
                setManufacturers(res.data || []);
            } catch (error) {
                message.error('Failed to fetch manufacturers');
            }
        };
        fetchManufacturers();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                setImages(initialValues.images || []);
            } else {
                form.resetFields();
                setImages([]);
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        if (readOnly) {
            onClose();
            return;
        }
        form.validateFields().then(values => {
            onSave({ ...values, images });
        });
    };

    const handleAddImage = () => {
        setEditingImage(null);
        imageForm.resetFields();
        setUploadModalVisible(true);
    };

    const handleEditImage = (index: number) => {
        setEditingImage({ index, image: images[index] });
        imageForm.setFieldsValue(images[index]);
        setUploadModalVisible(true);
    };

    const handleDeleteImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        if (currentImagePage > 1 && index === (newImages.length)) {
            setCurrentImagePage(currentImagePage - 1);
        }
    };

    const handleUploadImage = () => {
        imageForm.validateFields().then(values => {
            if (editingImage) {
                const newImages = [...images];
                newImages[editingImage.index] = values;
                setImages(newImages);
            } else {
                setImages([...images, values]);
            }
            setUploadModalVisible(false);
            imageForm.resetFields();
        });
    };

    const renderImageGallery = () => {
        const startIndex = (currentImagePage - 1) * imagesPerPage;
        const currentImage = images[startIndex];

        return (
            <Modal
                title="Images"
                open={imageModalVisible}
                onCancel={() => setImageModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setImageModalVisible(false)}>Close</Button>
                ]}
                width={800}
                centered
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>Vehicles</Title>
                    {!readOnly && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddImage} style={{ background: '#1a8a7a', borderColor: '#1a8a7a' }}>
                            Add
                        </Button>
                    )}
                </div>

                {images.length > 0 ? (
                    <div style={{ textAlign: 'center' }}>
                        <Card className={styles.galleryCard} bordered={false}>
                            {currentImage.url ? (
                                <img src={currentImage.url} alt={currentImage.color} className={styles.imagePreview} />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <PictureOutlined />
                                    <div style={{ fontSize: 14, marginTop: 8 }}>No Image</div>
                                </div>
                            )}
                            <div style={{ textAlign: 'left', marginTop: 16 }}>
                                <div style={{ fontSize: 18, fontWeight: 600 }}>Name: {currentImage.color}</div>
                                <div style={{ color: '#666', marginTop: 4 }}>Code: {currentImage.code}</div>
                            </div>
                            {!readOnly && (
                                <div className={styles.cardActions}>
                                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteImage(startIndex)} />
                                    <Button icon={<EditOutlined />} onClick={() => handleEditImage(startIndex)} />
                                </div>
                            )}
                        </Card>
                        <Pagination
                            current={currentImagePage}
                            total={images.length}
                            pageSize={imagesPerPage}
                            onChange={(page: number) => setCurrentImagePage(page)}
                            showSizeChanger={false}
                            simple
                        />
                    </div>
                ) : (
                    <Empty description="No images added yet" />
                )}
            </Modal>
        );
    };

    const renderUploadModal = () => (
        <Modal
            title="Image Upload"
            open={uploadModalVisible}
            onCancel={() => setUploadModalVisible(false)}
            onOk={handleUploadImage}
            okText="Upload"
            cancelText="Cancel"
            okButtonProps={{ style: { background: '#1a8a7a', borderColor: '#1a8a7a' } }}
            centered
        >
            <Form form={imageForm} layout="vertical">
                <Row gutter={16} align="middle">
                    <Col span={10}>
                        <div className={styles.uploadDragger}>
                            <UploadOutlined style={{ fontSize: 32, color: '#1a8a7a' }} />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    </Col>
                    <Col span={14}>
                        <Form.Item name="color" label="Color Name" rules={[{ required: true, message: 'Required' }]}>
                            <Input placeholder="Color Name" />
                        </Form.Item>
                        <Form.Item name="code" label="Color Code" rules={[{ required: true, message: 'Required' }]}>
                            <Input placeholder="Color Code" />
                        </Form.Item>
                        <Form.Item name="url" label="Image URL (Optional)">
                            <Input placeholder="https://..." />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={800}
            confirmLoading={loading}
            title={<div className={styles.modalTitle}>{readOnly ? "View Vehicle" : (initialValues ? "Modify Vehicle" : "Add Vehicle")}</div>}
            footer={readOnly ? [
                <Button key="close" onClick={onClose}>Close</Button>
            ] : [
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk} style={{ background: '#1a8a7a', borderColor: '#1a8a7a' }}>
                    {initialValues ? 'Update' : 'Save'}
                </Button>
            ]}
            centered
        >
            <Form form={form} layout="vertical">
                <Row gutter={24} justify="start" align="top">
                    <Col span={12}>
                        <Form.Item name="modelName" label="Model Name" rules={[{ required: true, message: 'Required' }]}>
                            <Input placeholder="e.g. FZ S FI V4 DLX" disabled={readOnly} />
                        </Form.Item>
                        <Form.Item name="manufacturerId" label="Manufacturer Name" rules={[{ required: true, message: 'Required' }]}>
                            <Select placeholder="Select Manufacturer" disabled={readOnly}>
                                {manufacturers.map(m => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="modelCode" label="Model Code">
                            <Input placeholder="e.g. BJH500" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Required' }]}>
                            <Select placeholder="Select Category" disabled={readOnly}>
                                <Option value="Motorcycle">Motorcycle</Option>
                                <Option value="Scooter">Scooter</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="vehicleStatus" label="Vehicle Status" rules={[{ required: true, message: 'Required' }]}>
                            <Select placeholder="Select Status" disabled={readOnly}>
                                <Option value="Available">Available</Option>
                                <Option value="Unavailable">Unavailable</Option>
                            </Select>
                        </Form.Item>
                        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                            <Button icon={<PictureOutlined />} onClick={() => setImageModalVisible(true)}>
                                Images ({images.length})
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>

            {renderImageGallery()}
            {renderUploadModal()}
        </Modal>
    );
};

export default VehicleMasterModal;
