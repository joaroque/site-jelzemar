// Script para funcionalidades do site
document.addEventListener('DOMContentLoaded', function() {
    // ==================== FUNÇÕES GERAIS ====================
    
    // Atualizar ano do copyright
    const copyrightElement = document.querySelector('.copyright p');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.innerHTML = copyrightElement.innerHTML.replace(/\d{4}/, currentYear);
    }
    
    // Destacar item ativo no menu baseado na URL atual
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPath || 
            (currentPath === 'index.html' && linkHref === 'index.html') ||
            (currentPath === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // ==================== BUSCA ====================
    const searchForm = document.querySelector('.search-bar form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = this.querySelector('input').value.trim();
            if (searchTerm !== '') {
                // Redirecionar para página de iPhones com parâmetro de busca
                window.location.href = `iphones.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    }
    
    // ==================== PRODUTOS ====================
    // Adicionar evento de clique para os cards de produto
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            // Extrair informações do produto
            const productTitle = this.querySelector('.product-title')?.textContent || 'Produto';
            const productPrice = this.querySelector('.product-price')?.textContent || '0 Kz';
            const productImage = this.querySelector('img')?.src || '';
            const productColor = this.querySelector('.product-color')?.textContent || 'Padrão';
            const productStorage = this.querySelector('.product-storage')?.textContent || 'Padrão';
            
            // Criar objeto do produto
            const product = {
                name: productTitle,
                price: parseFloat(productPrice.replace(/[^\d,-]/g, '').replace(',', '.')),
                image: productImage,
                color: productColor,
                storage: productStorage
            };
            
            // Salvar no localStorage e redirecionar para checkout
            localStorage.setItem('ekulu-checkout-item', JSON.stringify(product));
            window.location.href = 'finalizar_compra.html';
        });
    });
    
    // ==================== BANNERS ====================
    const banners = document.querySelectorAll('.banner-card');
    banners.forEach(banner => {
        banner.addEventListener('click', function() {
            const bannerTitle = this.querySelector('.banner-title')?.textContent || 'Promoção';
            // Redirecionar para página de iPhones com busca
            window.location.href = `iphones.html?search=${encodeURIComponent(bannerTitle)}`;
        });
    });
    
    // ==================== PÁGINA DE PAGAMENTO ====================
    // Seleção de método de pagamento
    const paymentMethods = document.querySelectorAll('.payment-method');
    if (paymentMethods.length > 0) {
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                paymentMethods.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                // Mostrar/esconder formulários de pagamento conforme método selecionado
                const methodType = this.getAttribute('data-method');
                const pixForm = document.querySelector('.pix-form');
                const cardForm = document.querySelector('.card-form');
                const cashForm = document.querySelector('.cash-form');
                
                if (pixForm) pixForm.style.display = methodType === 'pix' ? 'block' : 'none';
                if (cardForm) cardForm.style.display = methodType === 'card' ? 'block' : 'none';
                if (cashForm) cashForm.style.display = methodType === 'cash' ? 'block' : 'none';
            });
        });
    }
    
    // Formatação de campos
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0,5) + '-' + value.substring(5,8);
            }
            e.target.value = value.substring(0, 9);
        });
    }
    
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value.substring(0, 19);
        });
    }
    
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0,2) + '/' + value.substring(2,4);
            }
            e.target.value = value.substring(0, 5);
        });
    }
    
    const cardCvvInput = document.getElementById('card-cvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
    
    // Formatação de telefone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) {
                if (value.startsWith('244')) {
                    value = '+' + value.substring(0,3) + ' ' + value.substring(3,6) + ' ' + value.substring(6,9) + (value.length > 9 ? ' ' + value.substring(9,12) : '');
                } else if (value.length > 0) {
                    value = '+244 ' + value.substring(0,3) + ' ' + value.substring(3,6) + ' ' + value.substring(6,9);
                }
            } else if (value.length > 0) {
                value = '+244 ' + value;
            }
            e.target.value = value.substring(0, 22);
        });
    }
    
    // ==================== NAVEGAÇÃO SUAVE ====================
    // Navegação suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Atualizar menu ativo
                    navLinks.forEach(link => link.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
    
    // ==================== ANIMAÇÕES ====================
    // Adicionar classe para fade-in em elementos
    const fadeElements = document.querySelectorAll('.product-card, .banner-card, .feature-card');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
    
    // ==================== LOADING EM BOTÕES ====================
    // Função para mostrar loading em botões
    window.showButtonLoading = function(button, text = 'Processando...') {
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<span class="loading"></span> ${text}`;
        return originalText;
    };
    
    window.hideButtonLoading = function(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    };
    
    // ==================== TOAST NOTIFICATIONS ====================
    // Função para mostrar notificações toast
    window.showToast = function(message, type = 'success') {
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Estilos do toast
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.right = '30px';
        toast.style.backgroundColor = type === 'success' ? '#00c851' : '#ff3333';
        toast.style.color = 'white';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '8px';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '12px';
        toast.style.zIndex = '1000';
        toast.style.animation = 'slideIn 0.3s ease';
        toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast && toast.parentNode) toast.remove();
        }, 4000);
    };
    
    // ==================== VALIDAÇÕES ====================
    // Validação de email
    window.validateEmail = function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };
    
    // Validação de telefone (básica)
    window.validatePhone = function(phone) {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 9;
    };
    
    console.log('🚀 Site EkuluTech inicializado com sucesso!');
});