import React, { useState, useEffect, useRef } from "react";
import "../styles/CustomerTable.css";
import { CIcon } from '@coreui/icons-react';
import { cilFilter, cilSpreadsheet, cilPencil, cilTrash, cilSearch, cilCloudUpload } from '@coreui/icons';
import FilterPanel from "../components/modal/FilterPanel";
const data = [
    { id: "#20462", product: "Hat", customer: "Matt Dickerson", date: "13/05/2022", amount: "$4.95", payment: "Tranfer Bank", status: "Delivered", img: "https://via.placeholder.com/40" },
    { id: "#18933", product: "Laptop", customer: "Wiktoria", date: "22/05/2022", amount: "$8.95", payment: "Cash on Delivery", status: "Delivered", img: "https://via.placeholder.com/40" },
    { id: "#45169", product: "Phone", customer: "Trixie Byrd", date: "15/06/2022", amount: "$1,149.95", payment: "Cash on Delivery", status: "Process", img: "https://via.placeholder.com/40" },
];

const statusClass = {
    Delivered: "status-delivered",
    Process: "status-process",
    Canceled: "status-canceled",
};

export default function CustomerTable() {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const filterRef = useRef(null);

    // Bắt sự kiện click ngoài vùng
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilter(false);
            }
        };
        if (showFilter) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showFilter]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(data.map((row) => row.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const filteredData = data.filter(
        (row) =>
            row.product.toLowerCase().includes(search.toLowerCase()) ||
            row.customer.toLowerCase().includes(search.toLowerCase()) ||
            row.id.includes(search)
    );

    return (
        <div className="table-container">
            {/* Thanh trên */}
            <div className="top-bar">
                <div className="left-tools">
                    <div className="filter-wrapper" ref={filterRef}>
                        <button
                            className="btn-filter"
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <CIcon icon={cilFilter} />
                        </button>

                        {/* Panel hiển thị ngay dưới nút */}
                        {showFilter && <FilterPanel />}
                    </div>

                    <div className="search-wrapper">
                        <CIcon icon={cilSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tra cứu thông tin"
                            className="search-box"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="right-tools">
                    <button className="btn-excel"> <CIcon icon={cilSpreadsheet} /> Xuất Excel</button>
                    <button className="btn-import"><CIcon icon={cilCloudUpload} /> Import</button>
                    <button className="btn-add">+ Thêm học viên</button>
                </div>
            </div>
            {/* Bảng */}
            <table className="customer-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                className="custom-checkbox"
                                checked={selected.length === data.length}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((row, idx) => (
                        <tr key={idx}>
                            <td>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={selected.includes(row.id)}
                                    onChange={() => handleSelectRow(row.id)}
                                />
                            </td>
                            <td>
                                <div className="product-cell">
                                    <img src={row.img} alt={row.product} />
                                    <span>{row.product}</span>
                                </div>
                            </td>
                            <td>{row.customer}</td>
                            <td>{row.date}</td>
                            <td>{row.amount}</td>
                            <td>{row.payment}</td>
                            <td>
                                <span className={`status-badge ${statusClass[row.status]}`}>
                                    {row.status}
                                </span>
                            </td>
                            <td className="action-cell">
                                <button className="btn-edit">
                                    <CIcon icon={cilPencil} />
                                </button>
                                <button className="btn-delete">
                                    <CIcon icon={cilTrash} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
