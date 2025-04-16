document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Cập nhật số lượng sản phẩm trên icon giỏ hàng
    updateCartCount();
    
    // Xử lý nút thêm vào giỏ hàng ở trang danh sách sản phẩm
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            addToCart(productId, 1);
        });
    });
    
    // Hàm thêm sản phẩm vào giỏ hàng
    function addToCart(productId, quantity = 1) {
        // Hiển thị loading
        const addToCartBtn = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
        if (addToCartBtn) {
            const originalText = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang thêm...';
            addToCartBtn.disabled = true;
        }

        // Gọi API để thêm vào giỏ hàng (lưu trong session)
        fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        })
        .then(response => response.json())
        .then(data => {
            // Thay đổi nút lại sau khi thêm xong
            if (addToCartBtn) {
                addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
                setTimeout(() => {
                    addToCartBtn.innerHTML = originalText;
                    addToCartBtn.disabled = false;
                }, 2000);
            }

            // Cập nhật số lượng sản phẩm hiển thị trên icon giỏ hàng
            updateCartCount(data.totalQty);

            // Thông báo thành công
            showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
        })
        .catch(error => {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            if (addToCartBtn) {
                addToCartBtn.innerHTML = originalText;
                addToCartBtn.disabled = false;
            }
            showToast('Có lỗi xảy ra khi thêm sản phẩm!', 'danger');
        });
    }
    
    // Hàm cập nhật số lượng sản phẩm trên icon giỏ hàng
    function updateCartCount(count) {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = count;
            
            // Hiển thị số lượng nếu có sản phẩm, ẩn nếu không có
            if (count > 0) {
                cartCount.classList.remove('d-none');
            } else {
                cartCount.classList.add('d-none');
            }
        }
    }
    
    // Hàm hiển thị thông báo
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            // Tạo container nếu chưa có
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }

        const toastId = 'toast-' + Date.now();
        const html = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        document.getElementById('toast-container').insertAdjacentHTML('beforeend', html);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();

        // Tự động xóa toast sau khi ẩn
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    }

    // Hàm khởi tạo trang
    function initPage() {
        // Lấy thông tin giỏ hàng từ server và cập nhật số lượng
        fetch('/api/cart')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateCartCount(data.totalQty);
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
            });

        // Thêm sự kiện cho các nút "Thêm vào giỏ hàng"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.getAttribute('data-id');
                
                // Lấy số lượng từ input nếu có
                const quantityInput = document.querySelector(`.quantity-input[data-id="${productId}"]`);
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                
                addToCart(productId, quantity);
            });
        });

        // Xử lý nút tăng giảm số lượng trên trang chi tiết sản phẩm
        document.querySelectorAll('.btn-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
                const currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                }
            });
        });

        document.querySelectorAll('.btn-increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
                const maxStock = parseInt(input.getAttribute('max') || 100);
                const currentValue = parseInt(input.value);
                if (currentValue < maxStock) {
                    input.value = currentValue + 1;
                }
            });
        });
    }

    // Chạy hàm khởi tạo khi trang đã tải xong
    initPage();
});