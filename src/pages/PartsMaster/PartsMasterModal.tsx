import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography, Button, Checkbox, DatePicker, message, InputNumber, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getManufacturers } from '../../api/manufacturer';
import { getVehicles } from '../../api/vehicleMaster';
import { getHsns } from '../../api/hsn';
import { uploadImage } from '../../api/upload';
import styles from './PartsMaster.module.css';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface PartsMasterModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    readOnly?: boolean;
}

const PartsMasterModal: React.FC<PartsMasterModalProps> = ({ open, onClose, onSave, initialValues, loading, readOnly }) => {
    const [form] = Form.useForm();
    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [hsns, setHsns] = useState<any[]>([]);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mRes, vRes, hRes] = await Promise.all([
                    getManufacturers(),
                    getVehicles(),
                    getHsns()
                ]);
                setManufacturers(mRes.data?.data || mRes.data || []);
                setVehicles(vRes.data?.data || vRes.data || []);

                // HSN API returns { data: { hsn: [...] } }
                const hsnData = hRes.data?.data;
                setHsns(Array.isArray(hsnData?.hsn) ? hsnData.hsn : (Array.isArray(hsnData) ? hsnData : []));
            } catch (error) {
                message.error('Failed to fetch dependency data');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                // Ensure date and relations are handled
                const values = {
                    ...initialValues,
                    wefDate: initialValues.wefDate ? dayjs(initialValues.wefDate) : null,
                    vehicleSuit: initialValues.vehicleSuit?.map((item: any) => item.vehicleId) || [],
                    cgst: initialValues.hsn?.cgst,
                    sgst: initialValues.hsn?.sgst,
                    igst: initialValues.hsn?.igst,
                    cess: initialValues.hsn?.cess,
                };
                form.setFieldsValue(values);
                if (initialValues.url && Array.isArray(initialValues.url)) {
                    setFileList(initialValues.url.map((url: string, index: number) => ({
                        uid: `-${index}`,
                        name: `image-${index}`,
                        status: 'done',
                        url: url,
                    })));
                } else {
                    setFileList([]);
                }
            } else {
                form.resetFields();
                setFileList([]);
            }
        }
    }, [open, initialValues, form]);

    const handleHsnChange = (id: string) => {
        const selected = hsns.find((h: any) => h.id === id);
        if (selected) {
            form.setFieldsValue({
                cgst: selected.cgst,
                sgst: selected.sgst,
                igst: selected.igst,
                cess: selected.cess,
            });
        }
    };

    const handleUploadChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
    };

    const customUploadRequest = async (options: any) => {
        const { onSuccess, onError, file } = options;
        const fmData = new FormData();
        fmData.append("file", file);

        try {
            const res = await uploadImage(fmData);
            if (res.data && res.data.url) {
                onSuccess(res.data.url);
            } else {
                onError({ message: "Upload failed" });
            }
        } catch (err) {
            onError({ err });
            message.error("Image upload failed");
        }
    };

    const handleOk = () => {
        if (readOnly) {
            onClose();
            return;
        }
        form.validateFields().then(values => {
            const { vehicleSuit, cgst, sgst, igst, cess, ...rest } = values;

            // Extract image URLs from fileList
            const urls = fileList
                .map((file: any) => file.response || file.url)
                .filter((url: any) => !!url);

            // Convert back to backend format: "vehicleSuit":[{"id":"","vehicle":"..."}]
            const submitData = {
                ...rest,
                wefDate: rest.wefDate ? rest.wefDate.toISOString() : null,
                url: urls,
                vehicleSuit: vehicleSuit ? vehicleSuit.map((vid: string) => ({
                    id: "",
                    vehicle: vid
                })) : []
            };
            onSave(submitData);
        });
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={1000}
            confirmLoading={loading}
            title={
                <div className={styles.modalHeader}>
                    <Title level={4} className={styles.modalTitle}>Parts Master</Title>
                </div>
            }
            footer={readOnly ? [
                <Button key="close" onClick={onClose}>Close</Button>
            ] : [
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk} className={styles.addBtn}>
                    {initialValues?.id && !initialValues.isClone ? 'Update' : 'Save'}
                </Button>
            ]}
            centered
            bodyStyle={{ padding: '24px' }}
        >
            <Form form={form} layout="vertical">

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="partNumber" label={<span className={styles.formLabel}>Part No</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Input placeholder="Part No" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="oldPartNum" label={<span className={styles.formLabel}>Old Part No</span>}>
                            <Input placeholder="Old Part No" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="partName" label={<span className={styles.formLabel}>Part Name</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Input placeholder="Part Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="category" label={<span className={styles.formLabel}>Category</span>}>
                            <Input placeholder="Category" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="largeCategoryName" label={<span className={styles.formLabel}>Large Category Name</span>}>
                            <Input placeholder="Large Category Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="size" label={<span className={styles.formLabel}>Size</span>}>
                            <Input placeholder="Enter Size" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="mainPartNumber" label={<span className={styles.formLabel}>Main Part No.</span>}>
                            <Input placeholder="Enter Main Part Number" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="displayName" label={<span className={styles.formLabel}>Display name</span>}>
                            <Input placeholder="Enter Display Name" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="moq" label={<span className={styles.formLabel}>MOQ</span>}>
                            <InputNumber placeholder="Minimum Order Quantity" style={{ width: '100%' }} disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="manufacturerId" label={<span className={styles.formLabel}>Manufacturer</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Select placeholder="Select Manufacturer" disabled={readOnly} allowClear>
                                {manufacturers.map((m: any) => <Option key={m.id} value={m.id}>{m.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="vehicleSuit"
                            label={<span className={styles.formLabel}>Vehicle Model :</span>}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select Vehicle Models"
                                disabled={readOnly}
                                style={{ width: '100%' }}
                                allowClear
                                optionFilterProp="children"
                            >
                                {vehicles.map((v: any) => (
                                    <Option key={v.id} value={v.id}>
                                        {v.modelCode ? `${v.modelCode} - ${v.modelName}` : v.modelName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="color" label={<span className={styles.formLabel}>Color</span>}>
                            <Input placeholder="Color" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="partStatus" label={<span className={styles.formLabel}>Part Status</span>}>
                            <Select placeholder="Select Status" disabled={readOnly} allowClear>
                                <Option value="Available">Available</Option>
                                <Option value="Unavailable">Unavailable</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="hsnId" label={<span className={styles.formLabel}>HSN</span>} rules={[{ required: true, message: 'Required' }]}>
                            <Select placeholder="Select HSN" disabled={readOnly} allowClear onChange={handleHsnChange}>
                                {hsns.map((h: any) => <Option key={h.id} value={h.id}>{h.code}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="cgst" label={<span className={styles.formLabel}>CGST</span>}>
                            <Input addonAfter="%" disabled placeholder="CGST" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="sgst" label={<span className={styles.formLabel}>SGST</span>}>
                            <Input addonAfter="%" disabled placeholder="SGST" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="igst" label={<span className={styles.formLabel}>IGST</span>}>
                            <Input addonAfter="%" disabled placeholder="IGST" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="cess" label={<span className={styles.formLabel}>CESS</span>}>
                            <Input addonAfter="%" disabled placeholder="CESS" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="ndp" label={<span className={styles.formLabel}>NDP</span>}>
                            <InputNumber
                                placeholder="Net Dealer Price"
                                style={{ width: '100%' }}
                                disabled={readOnly}
                                addonBefore="₹"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="mrp" label={<span className={styles.formLabel}>MRP</span>} rules={[{ required: true, message: 'Required' }]}>
                            <InputNumber
                                placeholder="MRP"
                                style={{ width: '100%' }}
                                disabled={readOnly}
                                addonBefore="₹"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={6}>
                        <Form.Item name="wefDate" label={<span className={styles.formLabel}>WEF Date</span>}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <div style={{ marginTop: '30px' }}>
                            <Space size="large">
                                <Form.Item name="showInConsumer" valuePropName="checked" style={{ marginBottom: 0 }}>
                                    <Checkbox disabled={readOnly}>Show in Consumer</Checkbox>
                                </Form.Item>
                                <Form.Item name="showInAutoCloud" valuePropName="checked" style={{ marginBottom: 0 }}>
                                    <Checkbox disabled={readOnly}>Show in AutoCloud</Checkbox>
                                </Form.Item>
                            </Space>
                        </div>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={<span className={styles.formLabel}>Upload Image :</span>}>
                            <Upload
                                customRequest={customUploadRequest}
                                listType="picture"
                                fileList={fileList}
                                onChange={handleUploadChange}
                                disabled={readOnly}
                                multiple={true}
                            >
                                <Button icon={<UploadOutlined />}>Upload</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default PartsMasterModal;
