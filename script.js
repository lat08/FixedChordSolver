document.addEventListener('DOMContentLoaded', function() {
    // Các phần tử DOM
    const nutTinhToan = document.getElementById('calculateBtn');
    const canhBaoLoi = document.getElementById('errorAlert');
    const phanKetQua = document.getElementById('resultsSection');
    const cacNutTab = document.querySelectorAll('.tab-btn');
    const cacTab = document.querySelectorAll('.tab-pane');
    const nutBuocTruoc = document.getElementById('prevStepBtn');
    const nutBuocTiep = document.getElementById('nextStepBtn');
    const chiSoBuoc = document.getElementById('stepIndicator');
    const thongTinBuocHienTai = document.getElementById('currentStepInfo');
    
    // Biến biểu đồ
    let bieuDo = null;
    let buocHienTai = 0;
    let tatCaCacBuoc = [];
    
    // Nhập thư viện math.js
    const math = window.math;
    
    // Chức năng chuyển đổi tab
    cacNutTab.forEach(nut => {
        nut.addEventListener('click', function() {
            const idTab = this.dataset.tab;
            
            // Cập nhật nút tab đang hoạt động
            cacNutTab.forEach(nut => nut.classList.remove('active'));
            this.classList.add('active');
            
            // Cập nhật tab đang hoạt động
            cacTab.forEach(tab => tab.classList.remove('active'));
            document.getElementById(idTab).classList.add('active');
            
            // Vẽ lại biểu đồ nếu tab trực quan được chọn
            if (idTab === 'visualization' && bieuDo) {
                capNhatTrucQuanBuoc();
            }
        });
    });
    
    // Điều hướng bước
    nutBuocTruoc.addEventListener('click', function() {
        if (buocHienTai > 0) {
            buocHienTai--;
            capNhatTrucQuanBuoc();
        }
    });
    
    nutBuocTiep.addEventListener('click', function() {
        if (buocHienTai < tatCaCacBuoc.length - 1) {
            buocHienTai++;
            capNhatTrucQuanBuoc();
        }
    });
    
    // Xử lý sự kiện nhấn nút tính toán
    nutTinhToan.addEventListener('click', tinhDayCungMotDauCoDinh);
    
    // Hàm tính đạo hàm bậc nhất
    function daoHamBacNhat(f, x) {
        const h = 1e-6;
        return (f(x + h) - f(x - h)) / (2 * h);
    }
    
    // Hàm tính đạo hàm bậc hai
    function daoHamBacHai(f, x) {
        const h = 1e-6;
        return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    }
    
    function tinhDayCungMotDauCoDinh() {
        try {
            // Đặt lại các biến
            tatCaCacBuoc = [];
            buocHienTai = 0;
            
            // Ẩn thông báo lỗi trước đó
            canhBaoLoi.style.display = 'none';
            
            // Lấy giá trị đầu vào
            const phuongTrinh = document.getElementById('equation').value;
            const giaTriA = parseFloat(document.getElementById('a').value);
            const giaTriB = parseFloat(document.getElementById('b').value);
            const giaTriEpsilon = parseFloat(document.getElementById('epsilon').value);
            const soVongLapToiDa = parseInt(document.getElementById('maxIterations').value);
            
            // Kiểm tra đầu vào
            if (isNaN(giaTriA) || isNaN(giaTriB) || isNaN(giaTriEpsilon) || isNaN(soVongLapToiDa)) {
                throw new Error("Vui lòng nhập các giá trị số hợp lệ cho tất cả các đầu vào");
            }
            
            if (giaTriEpsilon <= 0) {
                throw new Error("Epsilon phải lớn hơn 0");
            }
            
            if (soVongLapToiDa <= 0) {
                throw new Error("Số vòng lặp tối đa phải lớn hơn 0");
            }
            
            // Hàm đánh giá phương trình với a và b
            const f = function(x) {
                try {
                    return math.evaluate(phuongTrinh, { x, a: giaTriA, b: giaTriB });
                } catch (error) {
                    throw new Error("Phương trình không hợp lệ. Vui lòng kiểm tra cú pháp.");
                }
            };
            let fa, fb;
            // Kiểm tra xem hàm có dấu trái ngược tại hai đầu mút không
            if (f(giaTriA) * f(giaTriB) > 0) {
                throw new Error("Hàm phải có dấu trái ngược tại hai đầu mút");
            }
            fa = f(giaTriA);
            fb = f(giaTriB);
            
            // Xác định đầu mút nào để cố định dựa trên đạo hàm bậc hai
            let d, x0;
            const f_b_bacHai = daoHamBacHai(f, giaTriB);
            const f_a_bacHai = daoHamBacHai(f, giaTriA);
            
            if (f(giaTriB) * f_b_bacHai > 0) {
                d = giaTriB;
                x0 = giaTriA;
            } else if (f(giaTriA) * f_a_bacHai > 0) {
                d = giaTriA;
                x0 = giaTriB;
            } else {
                throw new Error("Không thể xác định điểm cố định. Hãy thử khoảng khác.");
            }
            
            // Tính giá trị tuyệt đối nhỏ nhất của đạo hàm bậc nhất
            const da1 = daoHamBacNhat(f, giaTriA);
            const da2 = daoHamBacNhat(f, giaTriB);
            const m1 = Math.min(Math.abs(da1), Math.abs(da2));
            
            // Triển khai phương pháp dây cung một đầu cố định
            let xn = x0;
            let buoc = 0;
            let hoiTu = false;
            
            const cacVongLap = [];
            
            // Tạo các điểm cho đường cong hàm
            const min = Math.min(giaTriA, giaTriB) - 0.5;
            const max = Math.max(giaTriA, giaTriB) + 0.5;
            const kichThuocBuoc = (max - min) / 400;
            
            const diemHam = [];
            for (let x = min; x <= max; x += kichThuocBuoc) {
                diemHam.push({ x, y: f(x) });
            }
            
            // Bước khởi đầu
            let fxn = f(xn);
            let fd = f(d);
            
            while (buoc < soVongLapToiDa) {
                // Tính xấp xỉ tiếp theo
                const xn_tiep = xn - (fxn * (xn - d)) / (fxn - fd);
                const fxn_tiep = f(xn_tiep);
                
                // Tính sai số
                const saiSo = Math.abs(fxn_tiep) / m1;
                
                // Lưu dữ liệu vòng lặp
                cacVongLap.push({
                    buoc: buoc + 1,
                    x: xn,
                    fx: fxn,
                    x_tiep: xn_tiep,
                    fx_tiep: fxn_tiep,
                    saiSo: saiSo,
                    d: d,
                    fd: fd
                });
                
                // Lưu bước để trực quan hóa
                tatCaCacBuoc.push({
                    buoc: buoc + 1,
                    x: xn,
                    fx: fxn,
                    x_tiep: xn_tiep,
                    fx_tiep: fxn_tiep,
                    d: d,
                    fd: fd,
                    saiSo: saiSo
                });
                
                // Kiểm tra hội tụ
                if (saiSo <= giaTriEpsilon) {
                    hoiTu = true;
                    break;
                }
                
                // Cập nhật cho vòng lặp tiếp theo
                xn = xn_tiep;
                fxn = fxn_tiep;
                buoc++;
            }
            
            // Hiển thị kết quả
            hienThiKetQua({
                hoiTu: hoiTu,
                nghiem: tatCaCacBuoc[tatCaCacBuoc.length - 1].x_tiep,
                cacVongLap: cacVongLap,
                diemHam: diemHam,
                phuongTrinh: phuongTrinh,
                diemCoDinh: d,
                fa: fa,
                fb: fb,
                m1: m1,
                diemKhoiDau: x0,
                tongSoBuoc: tatCaCacBuoc.length
            });
            
            // Hiển thị phần kết quả
            phanKetQua.style.display = 'block';
            
            // Cập nhật điều hướng bước
            capNhatDieuHuongBuoc();
            
        } catch (loi) {
            // Hiển thị thông báo lỗi
            canhBaoLoi.textContent = loi.message;
            canhBaoLoi.style.display = 'block';
            phanKetQua.style.display = 'none';
        }
    }
    
    function hienThiKetQua(ketQua) {
      const dinhDangSo = (so) => (so !== undefined && !isNaN(so) ? so.toFixed(6) : "N/A");
  
      let phuongTrinhDaPhanTich, daoHamBacNhat, daoHamBacHai;
      try {
          phuongTrinhDaPhanTich = math.parse(ketQua.phuongTrinh);
          daoHamBacNhat = math.derivative(phuongTrinhDaPhanTich, "x").toTex();
          daoHamBacHai = math.derivative(math.derivative(phuongTrinhDaPhanTich, "x"), "x").toTex();
      } catch (loi) {
          console.error("Lỗi khi tính đạo hàm:", loi);
          daoHamBacNhat = "Lỗi";
          daoHamBacHai = "Lỗi";
      }
  
      let fa = dinhDangSo(ketQua.fa);
      let fb = dinhDangSo(ketQua.fb);
      let kiemTraKhoang = ketQua.fa * ketQua.fb > 0 ? "Sai (fa * fb > 0)" : "Đúng (fa * fb < 0)";
      
      let diemCoDinh = dinhDangSo(ketQua.diemCoDinh);
      let diemKhoiDau = dinhDangSo(ketQua.diemKhoiDau);
      let m1 = dinhDangSo(ketQua.m1);
  
      let htmlVongLap = "";
      if (ketQua.cacVongLap?.length) {
          ketQua.cacVongLap.forEach(vong => {
              htmlVongLap += `
                  <tr>
                      <td>${vong.buoc}</td>
                      <td>${dinhDangSo(vong.x_tiep)}</td>
                      <td>${dinhDangSo(vong.fx_tiep)}</td>
                      <td>${dinhDangSo(vong.saiSo)}</td>
                  </tr>
              `;
          });
      } else {
          htmlVongLap = "<tr><td colspan='4'>Không có dữ liệu</td></tr>";
      }
  
      document.getElementById("solutionX").textContent = `x = ${dinhDangSo(ketQua.nghiem)}`;
      document.getElementById("solutionFX").textContent = `f(x) = ${dinhDangSo(ketQua.cacVongLap?.at(-1)?.fx_tiep)}`;
  
      document.getElementById("stepDetails").innerHTML = `
          <p><strong>B1:</strong> Tính toán:</p>
          <p>\\[ f(x) = ${ketQua.phuongTrinh} \\]</p>
          <p>\\[ f'(x) = ${daoHamBacNhat} \\]</p>
          <p>\\[ f''(x) = ${daoHamBacHai} \\]</p>
  
          <p><strong>B2:</strong> Kiểm tra khoảng phân ly: \\( f(a) = ${fa}, f(b) = ${fb} \\) → ${kiemTraKhoang}</p>
  
          <p><strong>B3:</strong> Xác định điểm cố định \\( d = ${diemCoDinh} \\)</p>
  
          <p><strong>B4:</strong> Gán giá trị khởi đầu \\( x_0 = ${diemKhoiDau} \\)</p>
  
          <p><strong>B5:</strong> Tính \\( m_1 = ${m1} \\)</p>
  
          <p><strong>B6:</strong> Thực hiện phương pháp dây cung 1 đầu cố định:</p>
      `;
  
      document.getElementById("iterationTableBody").innerHTML = htmlVongLap;
      MathJax.typeset();
    }
    
    function capNhatDieuHuongBuoc() {
        // Cập nhật chỉ số bước
        chiSoBuoc.textContent = `Bước ${buocHienTai + 1} trong ${tatCaCacBuoc.length}`;
        
        // Cập nhật trạng thái nút
        nutBuocTruoc.disabled = buocHienTai === 0;
        nutBuocTiep.disabled = buocHienTai === tatCaCacBuoc.length - 1;
    }
    
    function capNhatTrucQuanBuoc() {
        if (tatCaCacBuoc.length === 0) return;
        
        // Lấy dữ liệu bước hiện tại
        const buoc = tatCaCacBuoc[buocHienTai];
        
        // Cập nhật điều hướng bước
        capNhatDieuHuongBuoc();
        
        // Cập nhật thông tin bước
        thongTinBuocHienTai.textContent = `Điểm hiện tại x${buocHienTai} = ${buoc.x.toFixed(6)} với f(x${buocHienTai}) = ${buoc.fx.toFixed(6)}. 
            Xấp xỉ tiếp theo x${buocHienTai + 1} = ${buoc.x_tiep.toFixed(6)} với f(x${buocHienTai + 1}) = ${buoc.fx_tiep.toFixed(6)}. 
            Sai số: ${buoc.saiSo.toFixed(6)}`;
        
        // Tạo hoặc cập nhật biểu đồ
        taoBieuDoBuoc(buoc);
    }
    
    function taoBieuDoBuoc(buoc) {
        const ctx = document.getElementById('chartCanvas').getContext('2d');
        
        // Hủy biểu đồ trước đó nếu tồn tại
        if (bieuDo) {
            bieuDo.destroy();
        }
        
        // Tạo các điểm hàm
        const phuongTrinh = document.getElementById('equation').value;
        const giaTriA = parseFloat(document.getElementById('a').value);
        const giaTriB = parseFloat(document.getElementById('b').value);
        
        const f = function(x) {
            return math.evaluate(phuongTrinh, { x, a: giaTriA, b: giaTriB });
        };
        
        const min = Math.min(giaTriA, giaTriB) - 0.5;
        const max = Math.max(giaTriA, giaTriB) + 0.5;
        const kichThuocBuoc = (max - min) / 400;
        
        const diemHam = [];
        for (let x = min; x <= max; x += kichThuocBuoc) {
            diemHam.push({ x, y: f(x) });
        }
        
        // Chuẩn bị dữ liệu cho trục x (y=0)
        const duLieuTrucX = [
            { x: min, y: 0 },
            { x: max, y: 0 }
        ];
        
        // Tạo biểu đồ
        bieuDo = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'f(x)',
                        data: diemHam,
                        borderColor: 'rgba(128, 0, 128, 1)', // Màu tím
                        backgroundColor: 'rgba(128, 0, 128, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        showLine: true,
                        fill: false
                    },
                    {
                        label: 'trục x',
                        data: duLieuTrucX,
                        borderColor: 'rgba(0, 0, 0, 0.5)',
                        borderWidth: 1,
                        pointRadius: 0,
                        showLine: true,
                        fill: false,
                        borderDash: [5, 5]
                    },
                    {
                        label: 'Điểm cố định (d)',
                        data: [{ x: buoc.d, y: buoc.fd }],
                        borderColor: 'rgba(0, 128, 0, 1)', // Màu xanh lá
                        backgroundColor: 'rgba(0, 128, 0, 1)',
                        borderWidth: 0,
                        pointRadius: 8,
                        pointStyle: 'circle',
                        showLine: false
                    },
                    {
                        label: `Điểm hiện tại (x${buocHienTai})`,
                        data: [{ x: buoc.x, y: buoc.fx }],
                        borderColor: 'rgba(255, 0, 0, 1)', // Màu đỏ
                        backgroundColor: 'rgba(255, 0, 0, 1)',
                        borderWidth: 0,
                        pointRadius: 8,
                        pointStyle: 'circle',
                        showLine: false
                    },
                    {
                        label: `Điểm tiếp theo (x${buocHienTai + 1})`,
                        data: [{ x: buoc.x_tiep, y: buoc.fx_tiep }],
                        borderColor: 'rgba(0, 0, 255, 1)', // Màu xanh dương
                        backgroundColor: 'rgba(0, 0, 255, 1)',
                        borderWidth: 0,
                        pointRadius: 8,
                        pointStyle: 'circle',
                        showLine: false
                    },
                    {
                        label: 'Đường dây cung',
                        data: [
                            { x: buoc.x, y: buoc.fx },
                            { x: buoc.d, y: buoc.fd }
                        ],
                        borderColor: 'rgba(0, 0, 255, 0.7)', // Màu xanh dương
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        showLine: true,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'x',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'f(x)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `(${context.parsed.x.toFixed(4)}, ${context.parsed.y.toFixed(4)})`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `Phương pháp dây cung một đầu cố định - Bước ${buocHienTai + 1}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
        
        // Thêm đường thẳng đứng cho điểm tiếp theo nếu plugin chú thích có sẵn
        try {
            if (Chart.Annotation) {
                bieuDo.options.plugins.annotation = {
                    annotations: {
                        diemTiepTheo: {
                            type: 'line',
                            mode: 'vertical',
                            scaleID: 'x',
                            value: buoc.x_tiep,
                            borderColor: 'rgba(0, 0, 255, 0.5)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: `x${buocHienTai + 1}`,
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                };
                bieuDo.update();
            }
        } catch (e) {
            console.log("Plugin chú thích không khả dụng");
        }
    }
  });