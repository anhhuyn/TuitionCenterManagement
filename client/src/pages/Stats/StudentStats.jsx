import React, { useEffect, useState } from "react";
import { getStudentsGroupBySchoolApi } from "../../util/api";
import "../../styles/SubjectStats.css";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Sector,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";

import "../../styles/StudentStats.css";
/*const COLORS = [
  "#0A1F44", // Navy rất đậm
  "#0B2A6F", // Navy đậm
  "#102F8C",
  "#163A8C",
  "#1E40AF",
  "#1D4ED8",
  "#2563EB",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD"  // Xanh rất sáng
];

const COLORS = [
    "#001D4A", // Navy đậm (giống miếng 43%)
    "#143A8B", // Navy
    "#1E4FB3", // Blue navy sáng hơn
    "#F7C65A", // Vàng sáng (32%)
    "#E6AF2E", // Vàng đậm (16%)
    "#F59E0B", // Cam vàng (8%)
    "#D97706", // Cam đậm
];*/


const COLORS = [
    "#2DC6C6", // xanh ngọc (turquoise)
    "#7BC96F", // xanh lá nhạt
    "#1E88E5", // xanh dương
    "#00A65A", // xanh lá đậm
    "#9B59B6", // tím
    "#F39C12", // cam
    "#FF6F91"  // hồng (Other)
];



const renderActiveShape = (props) => {
    const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill
    } = props;

    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2 + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Nếu miếng quá nhỏ (<6%) thì hiển thị bên ngoài
    if (percent < 0.06) {
        const outerX = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
        const outerY = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
        return (
            <text
                x={outerX}
                y={outerY}
                fill="#111"
                textAnchor={outerX > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize={12}
            >
                {(percent * 100).toFixed(1)}%
            </text>
        );
    }

    return (
        <text
            x={x}
            y={y}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
        >
            {(percent * 100).toFixed(1)}%
        </text>
    );
};

const CustomLegend = ({ data }) => {
    return (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {data.map((item, index) => (
                <li
                    key={`legend-${index}`}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10,
                        fontSize: 14,
                        color: "#111827"
                    }}
                >
                    <span
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: COLORS[index % COLORS.length],
                            marginRight: 8
                        }}
                    />
                    {item.name}
                </li>
            ))}
        </ul>
    );
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, value } = payload[0].payload;

        return (
            <div className="custom-tooltip">
                <div className="tooltip-value">
                    {name}: {value} học sinh
                </div>
            </div>
        );
    }
    return null;
};

const StudentStats = () => {
    const [stats, setStats] = useState({
        total: 0,
        createdThisMonth: 0,
        totalCap2: 0,
        totalCap3: 0,
        cap2Data: [],
        cap3Data: []
    });
    const [activeIndex, setActiveIndex] = useState(null);
    const [gradeData, setGradeData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        const fetchStudentStats = async () => {
            try {
                const res = await getStudentsGroupBySchoolApi();

                if (res?.errCode !== 0) return;

                const { totalStudents, data, totalStudentsBySchool } = res;

                const now = new Date();
                const month = now.getMonth();
                const year = now.getFullYear();

                let createdThisMonth = 0;
                let totalCap2 = 0;
                let totalCap3 = 0;
                let cap2Data = [];
                let cap3Data = [];

                Object.entries(data || {}).forEach(([level, schools]) => {
                    Object.entries(schools).forEach(([schoolName, students]) => {
                        students.forEach((s) => {
                            // Học sinh tạo trong tháng
                            if (s.createdAt) {
                                const created = new Date(s.createdAt.replace(" ", "T"));
                                if (
                                    created.getMonth() === month &&
                                    created.getFullYear() === year
                                ) {
                                    createdThisMonth++;
                                }
                            }
                        });
                    });

                    // Tổng số học sinh theo cấp học
                    if (level === "Cấp 2") {
                        totalCap2 = Object.values(schools).reduce(
                            (sum, arr) => sum + arr.length,
                            0
                        );
                        // Dữ liệu biểu đồ
                        cap2Data = Object.entries(schools)
                            .map(([schoolName, students]) => ({
                                name: schoolName,
                                value: students.length
                            }))
                            .sort((a, b) => b.value - a.value);

                    } else if (level === "Cấp 3") {
                        totalCap3 = Object.values(schools).reduce(
                            (sum, arr) => sum + arr.length,
                            0
                        );
                        cap3Data = Object.entries(schools)
                            .map(([schoolName, students]) => ({
                                name: schoolName,
                                value: students.length
                            }))
                            .sort((a, b) => b.value - a.value);
                    }
                });
                // ====== THỐNG KÊ THEO LỚP 6 → 12 ======
                const gradeMap = {
                    12: 0,
                    11: 0,
                    10: 0,
                    9: 0,
                    8: 0,
                    7: 0,
                    6: 0
                };

                Object.values(data || {}).forEach((schools) => {
                    Object.values(schools).forEach((students) => {
                        students.forEach((s) => {
                            const grade = Number(s.grade);
                            if (gradeMap[grade] !== undefined) {
                                gradeMap[grade]++;
                            }
                        });
                    });
                });

                const gradeOrder = [12, 11, 10, 9, 8, 7, 6];
                const gradeChartData = gradeOrder.map((grade) => ({
                    grade: `Lớp ${grade}`,
                    value: gradeMap[grade] || 0
                }));

                setGradeData(gradeChartData);

                const getMonthlyTotalStudents = (data) => {
                    const now = new Date();
                    const months = [];

                    // Tạo mảng 12 tháng gần nhất, từ tháng hiện tại trở về trước
                    for (let i = 11; i >= 0; i--) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                        months.push({ key, label: `${d.getMonth() + 1}/${d.getFullYear()}`, value: 0 });
                    }

                    // Đếm tổng học sinh tại mỗi tháng
                    let cumulative = 0;

                    // Sắp xếp tất cả học sinh theo createdAt
                    const allStudents = [];
                    Object.values(data || {}).forEach((schools) => {
                        Object.values(schools).forEach((students) => {
                            students.forEach((s) => {
                                if (s.createdAt) {
                                    allStudents.push(new Date(s.createdAt.replace(" ", "T")));
                                }
                            });
                        });
                    });

                    allStudents.sort((a, b) => a - b); // từ sớm đến muộn

                    months.forEach((month) => {
                        const [year, mon] = month.key.split("-").map(Number);
                        const monthEnd = new Date(year, mon, 0, 23, 59, 59); // cuối tháng
                        // Cộng dồn số học sinh <= cuối tháng này
                        while (allStudents.length && allStudents[0] <= monthEnd) {
                            cumulative++;
                            allStudents.shift();
                        }
                        month.value = cumulative;
                    });

                    return months;
                };

                // Gom nhóm "Khác" nếu trên 9 trường
                const groupOthers = (arr) => {
                    if (arr.length <= 9) return arr;
                    const top9 = arr.slice(0, 9);
                    const othersValue = arr.slice(9).reduce((sum, item) => sum + item.value, 0);
                    return [...top9, { name: "Khác", value: othersValue }];
                };

                setStats({
                    total: totalStudents || 0,
                    createdThisMonth,
                    totalCap2,
                    totalCap3,
                    cap2Data: preparePieData(cap2Data),
                    cap3Data: preparePieData(cap3Data)
                });

                setMonthlyData(getMonthlyTotalStudents(data));
            } catch (err) {
                console.error("Fetch student stats error:", err);
            }
        };

        fetchStudentStats();

    }, []);

    const renderMonthlyLineChart = () => (
        <div className="pie-chart-container">
            <h3>BIẾN ĐỘNG SỐ LƯỢNG HỌC SINH TRONG 12 THÁNG</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }} />
                    <YAxis tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }} />
                    <Tooltip cursor={false} content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#FF6F91" strokeWidth={3} activeDot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const preparePieData = (arr) => {
        if (!arr || arr.length <= 6) return arr;

        const top6 = arr.slice(0, 6);
        const othersValue = arr
            .slice(6)
            .reduce((sum, item) => sum + item.value, 0);

        return [...top6, { name: "Khác", value: othersValue }];
    };


    const renderPieChart = (title, data) => (
        <div className="pie-chart-container">
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        startAngle={90}
                        endAngle={-270}
                        label={renderLabel}
                        labelLine={false}
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>


                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        content={() => <CustomLegend data={data} />}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );


    const renderGradeBarChart = () => (
        <div className="pie-chart-container">
            <h3>SỐ LƯỢNG HỌC SINH THEO KHỐI LỚP</h3>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={gradeData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <YAxis
                        type="category"
                        dataKey="grade"
                        tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
                    />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 14, fill: "#374151", fontWeight: 500 }}
                    />
                    <Tooltip cursor={false} content={<CustomTooltip />} />
                    <Bar
                        dataKey="value"
                        fill="#2DC6C6"
                        barSize={23}
                        activeBar={false}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );


    return (
        <div className="subject-stats-wrapper">
            <h2 className="subject-stats-title">Thống kê học sinh</h2>

            <div className="subject-stats">
                <div className="stat-card all">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Tổng số học sinh</div>
                </div>

                <div className="stat-card new">
                    <div className="stat-number">{stats.createdThisMonth}</div>
                    <div className="stat-label">Học sinh mới trong tháng</div>
                </div>

                <div className="stat-card middle">
                    <div className="stat-number">{stats.totalCap2}</div>
                    <div className="stat-label">Học sinh cấp 2</div>
                </div>

                <div className="stat-card high">
                    <div className="stat-number">{stats.totalCap3}</div>
                    <div className="stat-label">Học sinh cấp 3</div>
                </div>
            </div>
            <div className="pie-charts-row">
                {renderPieChart("TỈ LỆ HỌC VIÊN CẤP 2 THEO TRƯỜNG", stats.cap2Data)}
                {renderPieChart("TỈ LỆ HỌC VIÊN CẤP 3 THEO TRƯỜNG", stats.cap3Data)}
            </div>

            {renderGradeBarChart()}
            {renderMonthlyLineChart()}

        </div>
    );
};

export default StudentStats;
