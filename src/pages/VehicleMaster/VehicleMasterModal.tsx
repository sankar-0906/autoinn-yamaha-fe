import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button, Card, Empty, Pagination, message, Upload, Image, Tabs, List, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, UploadOutlined, FilePdfOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { getManufacturers } from '../../api/manufacturer';
import { uploadImage } from '../../api/upload';
import styles from './VehicleMaster.module.css';

const { Title } = Typography;
const { Option } = Select;

interface VehicleImage {
    id?: string;
    color: string;
    code: string;
    url?: string;
}

interface VehicleFile {
    id?: string;
    name: string;
    url: string;
    fileType: string;
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
    const [files, setFiles] = useState<VehicleFile[]>([]);
    const [activeFileTab, setActiveFileTab] = useState<string>('Brochure');
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [fileModalVisible, setFileModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [fileUploadModalVisible, setFileUploadModalVisible] = useState(false);
    const [editingImage, setEditingImage] = useState<{ index: number; image: VehicleImage } | null>(null);
    const [imageForm] = Form.useForm();
    const [fileForm] = Form.useForm();
    const [currentImagePage, setCurrentImagePage] = useState(1);
    const [uploading, setUploading] = useState(false);
    const itemsPerPage = 1;

    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                const res = await getManufacturers();
                setManufacturers(res.data?.manufacturers || []);
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
                setFiles(initialValues.files || []);
            } else {
                form.resetFields();
                setImages([]);
                setFiles([]);
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        if (readOnly) {
            onClose();
            return;
        }
        form.validateFields().then(values => {
            onSave({ ...values, images, files });
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

    const handleCustomUpload = async (file: any, type: 'image' | 'file') => {
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            const res = await uploadImage(formData);
            const url = res.data?.data?.url;
            if (type === 'image') {
                imageForm.setFieldsValue({ url });
            } else {
                fileForm.setFieldsValue({ url, name: file.name });
            }
            message.success('Uploaded successfully');
        } catch (error) {
            message.error('Upload failed');
        } finally {
            setUploading(false);
        }
        return false; // Prevent default upload
    };

    const handleSaveFile = () => {
        fileForm.validateFields().then(values => {
            const newFile: VehicleFile = {
                ...values,
                fileType: activeFileTab
            };
            setFiles([...files, newFile]);
            setFileUploadModalVisible(false);
            fileForm.resetFields();
        });
    };

    const handleDeleteFile = (index: number, categoryFiles: VehicleFile[]) => {
        const fileToDelete = categoryFiles[index];
        const newFiles = files.filter(f => f !== fileToDelete);
        setFiles(newFiles);
    };

    const renderImageGallery = () => {
        const startIndex = (currentImagePage - 1) * itemsPerPage;
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
                zIndex={1001}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>Vehicle Images</Title>
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
                                <Image src={currentImage.url} alt={currentImage.color} className={styles.imagePreview} style={{ maxHeight: 300, objectFit: 'contain' }} />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <PictureOutlined />
                                    <div style={{ fontSize: 14, marginTop: 8 }}>No Image</div>
                                </div>
                            )}
                            <div style={{ textAlign: 'left', marginTop: 16 }}>
                                <div style={{ fontSize: 18, fontWeight: 600 }}>Color: {currentImage.color}</div>
                                <div style={{ color: '#666', marginTop: 4 }}>Code: {currentImage.code}</div>
                            </div>
                            {!readOnly && (
                                <div className={styles.cardActions} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteImage(startIndex)}>Delete</Button>
                                    <Button icon={<EditOutlined />} onClick={() => handleEditImage(startIndex)}>Edit</Button>
                                </div>
                            )}
                        </Card>
                        <Pagination
                            current={currentImagePage}
                            total={images.length}
                            pageSize={itemsPerPage}
                            onChange={(page: number) => setCurrentImagePage(page)}
                            showSizeChanger={false}
                            simple
                            style={{ marginTop: 16 }}
                        />
                    </div>
                ) : (
                    <Empty description="No images added yet" />
                )}
            </Modal>
        );
    };

    const renderFileGallery = () => {
        const categories = ['Brochure', 'Parts Manual', 'Service Manual'];

        return (
            <Modal
                title="Files"
                open={fileModalVisible}
                onCancel={() => setFileModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setFileModalVisible(false)}>Close</Button>
                ]}
                width={700}
                centered
                zIndex={1001}
            >
                <Tabs
                    activeKey={activeFileTab}
                    onChange={setActiveFileTab}
                    type="card"
                    items={categories.map(cat => {
                        const categoryFiles = files.filter(f => f.fileType === cat);
                        return {
                            key: cat,
                            label: cat,
                            children: (
                                <div style={{ minHeight: 300, paddingTop: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                                        {!readOnly && (
                                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                                fileForm.resetFields();
                                                setFileUploadModalVisible(true);
                                            }} style={{ background: '#1a8a7a', borderColor: '#1a8a7a' }}>
                                                New
                                            </Button>
                                        )}
                                    </div>
                                    <List
                                        dataSource={categoryFiles}
                                        locale={{ emptyText: <Empty description={`No ${cat} added yet`} /> }}
                                        renderItem={(item, index) => (
                                            <List.Item
                                                actions={[
                                                    <Button key="view" icon={<EyeOutlined />} type="link" onClick={() => window.open(item.url, '_blank')} />,
                                                    !readOnly && (
                                                        <Popconfirm
                                                            key="delete"
                                                            title="Delete this file?"
                                                            onConfirm={() => handleDeleteFile(index, categoryFiles)}
                                                        >
                                                            <Button icon={<DeleteOutlined />} type="link" danger />
                                                        </Popconfirm>
                                                    )
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />}
                                                    title={item.name}
                                                    description={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.url?.split('/').pop()}</Typography.Text>}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            )
                        };
                    })}
                />
            </Modal>
        );
    };

    const imageUrl = Form.useWatch('url', imageForm);

    const renderUploadModal = () => (
        <Modal
            title="Image Upload"
            open={uploadModalVisible}
            onCancel={() => setUploadModalVisible(false)}
            onOk={handleUploadImage}
            okText={uploading ? "Uploading..." : "Upload"}
            cancelText="Cancel"
            okButtonProps={{
                style: { background: '#1a8a7a', borderColor: '#1a8a7a' },
                disabled: uploading
            }}
            centered
            zIndex={1002}
        >
            <Form form={imageForm} layout="vertical">
                <Row gutter={16} align="middle">
                    <Col span={10}>
                        <Upload
                            beforeUpload={(file) => handleCustomUpload(file, 'image')}
                            showUploadList={false}
                        >
                            <div className={styles.uploadDragger}>
                                {uploading ? (
                                    <UploadOutlined spin style={{ fontSize: 32, color: '#1a8a7a' }} />
                                ) : imageUrl ? (
                                    <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <>
                                        <PlusOutlined style={{ fontSize: 32, color: '#1a8a7a' }} />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </>
                                )}
                            </div>
                        </Upload>
                    </Col>
                    <Col span={14}>
                        <Form.Item
                            name="color"
                            label="Color Name"
                            rules={[
                                { required: true, message: 'Required' },
                                { pattern: /^[a-zA-Z0-9\s]+$/, message: 'Only letters and numbers allowed' }
                            ]}
                            normalize={(value) => {
                                const val = (value || '').replace(/[^a-zA-Z0-9\s]/g, '');
                                return val.replace(/\b\w+/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
                            }}
                        >
                            <Input placeholder="Color Name" />
                        </Form.Item>
                        <Form.Item
                            name="code"
                            label="Color Code"
                            rules={[
                                { required: true, message: 'Required' },
                                { pattern: /^[A-Z0-9]+$/, message: 'Only uppercase alphanumerics allowed' }
                            ]}
                            normalize={(value) => (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')}
                        >
                            <Input placeholder="Color Code" />
                        </Form.Item>
                        <Form.Item name="url" label="Image URL">
                            <Input placeholder="Auto-populated on upload" readOnly />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );

    const renderFileUploadModal = () => (
        <Modal
            title={`${activeFileTab} Upload`}
            open={fileUploadModalVisible}
            onCancel={() => setFileUploadModalVisible(false)}
            onOk={handleSaveFile}
            okText="Save"
            okButtonProps={{ disabled: uploading }}
            centered
            zIndex={1002}
        >
            <Form form={fileForm} layout="vertical">
                <Form.Item name="name" label={`${activeFileTab} Name`} rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder={`Enter ${activeFileTab} Name`} />
                </Form.Item>
                <Form.Item name="url" label={`${activeFileTab} URL`} rules={[{ required: true, message: 'Upload required' }]}>
                    <Input placeholder="Paste URL or upload below" />
                </Form.Item>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Upload
                        beforeUpload={(file) => handleCustomUpload(file, 'file')}
                        showUploadList={false}
                    >
                        <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} loading={uploading}>
                            {uploading ? 'Uploading...' : 'Choose File'}
                        </Button>
                    </Upload>
                </div>
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
                        <Form.Item
                            name="modelName"
                            label="Model Name"
                            rules={[
                                { required: true, message: 'Required' },
                                { pattern: /^[a-zA-Z0-9\s-]+$/, message: 'No special characters allowed except hyphen' }
                            ]}
                            normalize={(value) => (value || '').toUpperCase().replace(/[^A-Z0-9\s-]/g, '')}
                        >
                            <Input placeholder="e.g. FZ S FI V4 DLX" disabled={readOnly} />
                        </Form.Item>
                        <Form.Item name="manufacturerId" label="Manufacturer Name" rules={[{ required: true, message: 'Required' }]}>
                            <Select placeholder="Select Manufacturer" disabled={readOnly}>
                                {manufacturers.map((m: any) => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="modelCode"
                            label="Model Code"
                            rules={[
                                { required: true, message: 'Required' },
                                { pattern: /^[A-Z0-9]+$/, message: 'Only uppercase alphanumerics allowed' }
                            ]}
                            normalize={(value) => (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')}
                        >
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
                            <Button icon={<FilePdfOutlined />} onClick={() => setFileModalVisible(true)}>
                                Files ({files.length})
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>

            {renderImageGallery()}
            {renderUploadModal()}
            {renderFileGallery()}
            {renderFileUploadModal()}
        </Modal>
    );
};

export default VehicleMasterModal;
