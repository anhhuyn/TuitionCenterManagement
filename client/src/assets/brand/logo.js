export const logo = [
  '1000 250',
  `
  <g fill="none">
    <!-- Notebook icon: mở ra 2 trang (to hơn) -->
    <g>
      <!-- bìa trái màu xanh -->
      <rect x="10" y="20" width="26" height="180" rx="10" fill="#7494ec"/>
      
      <!-- khung sổ (2 trang, rộng + cao hơn) -->
      <rect x="36" y="20" width="280" height="180" rx="14" fill="#fff" stroke="#7494ec" stroke-width="6"/>
      
      <!-- đường chia giữa sổ -->
      <line x1="176" y1="20" x2="176" y2="200" stroke="#7494ec" stroke-width="4" stroke-dasharray="7 7"/>
      
      <!-- dòng kẻ trang trái -->
      <g stroke="#7494ec" stroke-opacity=".6" stroke-width="2">
        <line x1="56" y1="60" x2="150" y2="60"/>
        <line x1="56" y1="95" x2="150" y2="95"/>
        <line x1="56" y1="130" x2="150" y2="130"/>
        <line x1="56" y1="165" x2="150" y2="165"/>
      </g>
      
      <!-- dòng kẻ trang phải -->
      <g stroke="#7494ec" stroke-opacity=".6" stroke-width="2">
        <line x1="200" y1="60" x2="300" y2="60"/>
        <line x1="200" y1="95" x2="300" y2="95"/>
        <line x1="200" y1="130" x2="300" y2="130"/>
        <line x1="200" y1="165" x2="300" y2="165"/>
      </g>
      
      <!-- khoen xoắn giữa gáy -->
      <g transform="translate(176,40)" stroke="#7494ec" stroke-width="4">
        <circle cx="0" cy="0" r="4"/>
        <circle cx="0" cy="35" r="4"/>
        <circle cx="0" cy="70" r="4"/>
        <circle cx="0" cy="105" r="4"/>
        <circle cx="0" cy="140" r="4"/>
      </g>
    </g>

    <!-- Wordmark: "tri thức" kiểu thư pháp -->
    <g transform="translate(340, 0)">
      <!-- chữ nền trắng -->
      <text x="0" y="150"
            font-family="'Brush Script MT', cursive"
            font-weight="700"
            font-size="130"
            letter-spacing="2"
            fill="#fff">Tri Thức</text>
      <!-- viền xanh -->
      <text x="0" y="150"
            font-family="'Brush Script MT', cursive"
            font-weight="700"
            font-size="130"
            letter-spacing="2"
            fill="none"
            stroke="#7494ec"
            stroke-width="5">Tri Thức</text>
    </g>
  </g>
  `,
];
