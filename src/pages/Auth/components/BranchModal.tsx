import React from 'react';
import { Modal, Form, Input, Button } from 'antd';


interface BranchModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (branch: any) => void;
}

const BranchModal: React.FC<BranchModalProps> = ({ open, onClose, onAdd }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then((values) => {
            onAdd(values);
            form.resetFields();
            onClose();
        });
    };

    const modalStyles = {
        mask: { backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.6)' },
        content: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '16px' },
        header: { background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' },
        footer: { borderTop: '1px solid rgba(255,255,255,0.1)' }
    };

    return (
        <Modal
            title={<span style={{ color: 'white' }}>Add Branch</span>}
            open={open}
            onCancel={() => { form.resetFields(); onClose(); }}
            styles={modalStyles}
            footer={[
                <Button key="cancel" onClick={() => { form.resetFields(); onClose(); }} style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                    Cancel
                </Button>,
                <Button key="add" type="primary" onClick={handleOk} style={{ background: '#1a8a7a', borderColor: '#1a8a7a' }}>
                    Add Branch
                </Button>,
            ]}
            destroyOnClose
            centered
        >
            <Form form={form} layout="vertical" size="middle" requiredMark={false}>
                <Form.Item
                    name="name"
                    label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Branch Name</span>}
                    rules={[{ required: true, message: 'Please enter branch name' }]}
                >
                    <Input placeholder="Branch Name" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }} />
                </Form.Item>
                <Form.Item name="gst" label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>GST Number</span>}>
                    <Input placeholder="GST Number" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }} />
                </Form.Item>
                <Form.Item
                    name="email"
                    label={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Branch Email</span>}
                    rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                >
                    <Input placeholder="Branch Email" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BranchModal;
