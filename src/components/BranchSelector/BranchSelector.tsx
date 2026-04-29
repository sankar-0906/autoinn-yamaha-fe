import React, { useState, useEffect } from 'react';
import { Select, Tag, Button, Row, Col } from 'antd';
import { useBranch } from '../../context/BranchContext';

const { Option } = Select;

interface BranchSelectorProps {
    collapsed?: boolean;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({ collapsed }) => {
    const { branches, selectedBranchIds, setSelectedBranchIds, loading } = useBranch();
    const [isOpen, setIsOpen] = useState(false);
    const [tempSelection, setTempSelection] = useState<string[]>(selectedBranchIds);

    // Sync temp selection when selectedBranchIds changes or when opening
    useEffect(() => {
        setTempSelection(selectedBranchIds);
    }, [selectedBranchIds, isOpen]);

    const handleOk = () => {
        setSelectedBranchIds(tempSelection);
        setIsOpen(false);
    };

    const handleChange = (values: string[]) => {
        setTempSelection(values);
    };

    if (collapsed) return null;

    return (
        <div style={{ marginBottom: '16px', padding: '0 4px' }}>
            {/* Row 1: Selected Tags (Teal style from image) */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    cursor: 'pointer', 
                    marginBottom: '8px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    minHeight: '24px'
                }}
            >
                {selectedBranchIds.length > 0 ? (
                    selectedBranchIds.map(id => {
                        const branch = branches.find(b => b.id === id);
                        return (
                            <Tag 
                                key={id} 
                                style={{ 
                                    backgroundColor: '#006a71', 
                                    color: '#ffffff',
                                    border: 'none', 
                                    fontWeight: 600,
                                    borderRadius: '4px',
                                    padding: '2px 10px',
                                    margin: 0
                                }}
                            >
                                {branch?.name || id}
                            </Tag>
                        );
                    })
                ) : (
                    <div style={{ color: '#006a71', fontWeight: 700, fontSize: '13px' }}>
                        Select Branch
                    </div>
                )}
            </div>

            {/* Row 2: Select (with internal tags) + OK Button */}
            {isOpen && (
                <Row gutter={8} align="top" style={{ marginTop: '8px' }}>
                    <Col flex="1">
                        <Select
                            mode="multiple"
                            placeholder="Select Branch"
                            style={{ width: '100%' }}
                            value={tempSelection}
                            onChange={handleChange}
                            loading={loading}
                            // Removed maxTagCount={0} to show tags inside the field as requested
                            // Ensure no "+N" count is shown by NOT setting maxTagCount
                            dropdownMatchSelectWidth={false}
                            autoFocus
                            defaultOpen={true}
                            showSearch
                            optionFilterProp="children"
                            className="branch-select-input"
                            tagRender={(props) => {
                                const { label, closable, onClose } = props;
                                const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                };
                                return (
                                    <Tag
                                        onMouseDown={onPreventMouseDown}
                                        closable={closable}
                                        onClose={onClose}
                                        style={{ 
                                            marginRight: 3, 
                                            marginTop: 2, 
                                            marginBottom: 2,
                                            backgroundColor: '#f5f5f5',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '2px'
                                        }}
                                    >
                                        {label}
                                    </Tag>
                                );
                            }}
                        >
                            {branches.map(branch => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            onClick={handleOk}
                            style={{ 
                                backgroundColor: '#006a71', 
                                borderColor: '#006a71',
                                fontWeight: 600,
                                height: '32px',
                                borderRadius: '4px'
                            }}
                        >
                            OK
                        </Button>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default BranchSelector;
