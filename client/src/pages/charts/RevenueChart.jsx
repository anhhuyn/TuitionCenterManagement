import React, { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CFormSelect,
    CSpinner,
    CButton // [MỚI]
} from '@coreui/react';
import { CChartBar } from '@coreui/react-chartjs';
import CIcon from '@coreui/icons-react';
import { 
    cilMoney, 
    cilArrowThickTop, 
    cilArrowThickBottom, 
    cilCloudDownload // [MỚI] Icon tải xuống
} from '@coreui/icons';

// [MỚI] Import thêm api export
import { getRevenueStatisticsApi, exportRevenueStatisticsApi } from "../../util/api";

const RevenueChart = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false); // [MỚI] State loading cho nút export

    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalExpense: 0,
        profit: 0
    });

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    useEffect(() => {
        fetchData(year);
    }, [year]);

    const fetchData = async (selectedYear) => {
        setIsLoading(true);
        try {
            const res = await getRevenueStatisticsApi(selectedYear);
            let finalData = [];

            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                finalData = res.data.data;
            } else if (res.data && Array.isArray(res.data)) {
                finalData = res.data;
            } else if (Array.isArray(res)) {
                finalData = res;
            }

            if (finalData.length > 0) {
                processChartData(finalData);
            } else {
                setChartData({ labels: [], datasets: [] });
                setSummary({ totalRevenue: 0, totalExpense: 0, profit: 0 });
            }
        } catch (error) {
            console.error("Lỗi lấy thống kê doanh thu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Trong RevenueChart.jsx

const handleExport = async () => {
    setIsExporting(true);
    try {
        const response = await exportRevenueStatisticsApi(year);
        
        // --- SỬA ĐOẠN NÀY ---
        // Kiểm tra xem dữ liệu thực sự nằm ở đâu (do cấu hình axios mỗi dự án khác nhau)
        // Nếu có interceptor: response có thể chính là Blob.
        // Nếu không có interceptor: response.data mới là Blob.
        const blobData = response.data ? response.data : response;

        // Kiểm tra an toàn: Nếu dữ liệu không phải là Blob (ví dụ trả về JSON lỗi), dừng lại
        if (!(blobData instanceof Blob)) {
            console.error("Dữ liệu tải về không đúng định dạng Blob:", blobData);
            alert("Lỗi dữ liệu từ server.");
            return;
        }

        // Tạo URL tải file
        const url = window.URL.createObjectURL(blobData);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Bao_Cao_Doanh_Thu_Nam_${year}.xlsx`);
        document.body.appendChild(link);
        link.click();
        
        // Dọn dẹp
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Lỗi xuất file excel:", error);
        alert("Không thể xuất báo cáo. Vui lòng thử lại sau.");
    } finally {
        setIsExporting(false);
    }
};

    const processChartData = (data) => {
        const labels = data.map(item => `Tháng ${item.month}`);
        const revenueData = data.map(item => item.totalRevenue);
        const expenseData = data.map(item => item.totalExpense);

        const totalRev = revenueData.reduce((a, b) => a + b, 0);
        const totalExp = expenseData.reduce((a, b) => a + b, 0);
        setSummary({
            totalRevenue: totalRev,
            totalExpense: totalExp,
            profit: totalRev - totalExp
        });

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Thực thu',
                    backgroundColor: '#2eb85c',
                    hoverBackgroundColor: '#218838',
                    data: revenueData,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                    borderRadius: 4,
                },
                {
                    label: 'Thực chi',
                    backgroundColor: '#e55353',
                    hoverBackgroundColor: '#c0392b',
                    data: expenseData,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                    borderRadius: 4,
                }
            ],
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <>
            <CRow className="mb-4">
                <CCol sm={12} md={4}>
                    <div className="card text-white bg-success mb-3 shadow-sm" style={{ border: 'none' }}>
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-white-50 small text-uppercase fw-bold">Tổng Thu (Năm {year})</div>
                                <div className="fs-4 fw-bold">{formatCurrency(summary.totalRevenue)}</div>
                            </div>
                            <CIcon icon={cilArrowThickTop} size="xl" style={{ opacity: 0.8 }} />
                        </div>
                    </div>
                </CCol>
                <CCol sm={12} md={4}>
                    <div className="card text-white bg-danger mb-3 shadow-sm" style={{ border: 'none' }}>
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-white-50 small text-uppercase fw-bold">Tổng Chi (Năm {year})</div>
                                <div className="fs-4 fw-bold">{formatCurrency(summary.totalExpense)}</div>
                            </div>
                            <CIcon icon={cilArrowThickBottom} size="xl" style={{ opacity: 0.8 }} />
                        </div>
                    </div>
                </CCol>
                <CCol sm={12} md={4}>
                    <div className={`card text-white mb-3 shadow-sm ${summary.profit >= 0 ? 'bg-primary' : 'bg-warning'}`} style={{ border: 'none' }}>
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-white-50 small text-uppercase fw-bold">Lợi Nhuận Thực Tế</div>
                                <div className="fs-4 fw-bold">{formatCurrency(summary.profit)}</div>
                            </div>
                            <CIcon icon={cilMoney} size="xl" style={{ opacity: 0.8 }} />
                        </div>
                    </div>
                </CCol>
            </CRow>

            <CCard className="mb-4 shadow border-0">
                <CCardHeader className="d-flex justify-content-between align-items-center bg-transparent border-bottom-0 py-3">
                    <div>
                        <h5 className="m-0 fw-bold text-dark">
                            Biểu đồ tăng trưởng tài chính
                        </h5>
                        <small className="text-muted">Dữ liệu chi tiết từng tháng</small>
                    </div>
                    
                    {/* [MỚI] Khu vực chứa nút Export và Select Box */}
                    <div className="d-flex align-items-center gap-2">
                        <CButton 
                            color="success" 
                            variant="outline" 
                            size="sm" 
                            onClick={handleExport}
                            disabled={isExporting}
                            className="d-flex align-items-center"
                        >
                            {isExporting ? (
                                <CSpinner size="sm" aria-hidden="true" />
                            ) : (
                                <CIcon icon={cilCloudDownload} className="me-1" />
                            )}
                            {isExporting ? ' Đang tải...' : 'Xuất Excel'}
                        </CButton>

                        <div style={{ width: '120px' }}>
                            <CFormSelect
                                size="sm"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="fw-bold border-secondary"
                                style={{ cursor: 'pointer' }}
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>Năm {y}</option>
                                ))}
                            </CFormSelect>
                        </div>
                    </div>

                </CCardHeader>
                <CCardBody>
                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <CSpinner color="primary" variant="grow" />
                        </div>
                    ) : (
                        <div style={{ height: '400px', width: '100%' }}>
                            <CChartBar
                                data={chartData}
                                style={{ height: '100%', width: '100%' }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    interaction: { mode: 'index', intersect: false },
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
                                        },
                                        tooltip: {
                                            enabled: true,
                                            position: 'nearest',
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            padding: 10,
                                            cornerRadius: 6,
                                            titleFont: { weight: 'bold' },
                                            callbacks: {
                                                label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
                                            },
                                        },
                                    },
                                    scales: {
                                        x: { grid: { display: false, drawBorder: false }, ticks: { font: { size: 11 } } },
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: '#f3f4f7', drawBorder: false },
                                            ticks: {
                                                color: '#8a93a2',
                                                callback: (value) => {
                                                    if (value >= 1_000_000_000) return value / 1_000_000_000 + ' Tỷ';
                                                    if (value >= 1_000_000) return value / 1_000_000 + ' Tr';
                                                    if (value >= 1_000) return value / 1_000 + ' k';
                                                    return value;
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </CCardBody>
            </CCard>
        </>
    );
};

export default RevenueChart;