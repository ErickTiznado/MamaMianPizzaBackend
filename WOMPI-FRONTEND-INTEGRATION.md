# 🔌 Integración Frontend - Wompi 3DS con Mama Mian Pizza

## 📋 Tabla de Contenidos
1. [Vanilla JavaScript](#vanilla-javascript)
2. [React.js](#reactjs)
3. [Vue.js](#vuejs)
4. [Angular](#angular)
5. [Flujo Completo](#flujo-completo)
6. [Manejo de Errores](#manejo-de-errores)

---

## 🚀 Vanilla JavaScript

### 1. Formulario de Pago Básico

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago con Wompi - Mama Mian Pizza</title>
    <script src="https://checkout.wompi.co/widget.js"></script>
    <style>
        .payment-form {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn {
            background-color: #e74c3c;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            background-color: #c0392b;
        }
        .btn:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
        }
        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
        .error {
            color: #e74c3c;
            margin: 10px 0;
        }
        .success {
            color: #27ae60;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="payment-form">
        <h1>🍕 Finalizar Pago - Mama Mian Pizza</h1>
        
        <form id="paymentForm">
            <div class="form-group">
                <label for="customerName">Nombre Completo:</label>
                <input type="text" id="customerName" required>
            </div>
            
            <div class="form-group">
                <label for="customerEmail">Email:</label>
                <input type="email" id="customerEmail" required>
            </div>
            
            <div class="form-group">
                <label for="customerPhone">Teléfono:</label>
                <input type="tel" id="customerPhone" required>
            </div>
            
            <div class="form-group">
                <label for="orderTotal">Total del Pedido:</label>
                <input type="number" id="orderTotal" step="0.01" min="1" required>
            </div>
            
            <div id="errorMsg" class="error"></div>
            <div id="successMsg" class="success"></div>
            
            <div class="loading" id="loading">
                <p>Procesando pago... ⏳</p>
            </div>
            
            <button type="submit" class="btn" id="payBtn">
                💳 Pagar con Wompi
            </button>
        </form>
    </div>

    <script>
        class WompiPayment {
            constructor() {
                this.apiBaseUrl = 'https://api.mamamianpizza.com/api';
                this.init();
            }

            init() {
                document.getElementById('paymentForm').addEventListener('submit', this.handlePayment.bind(this));
            }

            async handlePayment(e) {
                e.preventDefault();
                
                const formData = this.getFormData();
                if (!this.validateForm(formData)) return;

                this.setLoading(true);
                this.clearMessages();

                try {
                    // 1. Crear pedido con pago
                    const orderData = await this.createOrderWithPayment(formData);
                    
                    // 2. Inicializar widget de Wompi
                    await this.initializeWompiWidget(orderData);
                    
                } catch (error) {
                    console.error('Error en el pago:', error);
                    this.showError('Error al procesar el pago: ' + error.message);
                } finally {
                    this.setLoading(false);
                }
            }

            getFormData() {
                return {
                    customerName: document.getElementById('customerName').value,
                    customerEmail: document.getElementById('customerEmail').value,
                    customerPhone: document.getElementById('customerPhone').value,
                    orderTotal: parseFloat(document.getElementById('orderTotal').value)
                };
            }

            validateForm(data) {
                if (!data.customerName || !data.customerEmail || !data.customerPhone || !data.orderTotal) {
                    this.showError('Por favor completa todos los campos');
                    return false;
                }
                
                if (data.orderTotal < 1) {
                    this.showError('El monto debe ser mayor a $1');
                    return false;
                }
                
                return true;
            }

            async createOrderWithPayment(formData) {
                const response = await fetch(`${this.apiBaseUrl}/orders/create-with-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        // Datos del pedido
                        total: formData.orderTotal,
                        customer_name: formData.customerName,
                        customer_email: formData.customerEmail,
                        customer_phone: formData.customerPhone,
                        items: [
                            {
                                name: "Pizza Especial",
                                quantity: 1,
                                price: formData.orderTotal
                            }
                        ],
                        // Datos de pago
                        payment_method: 'wompi_3ds'
                    })
                });

                if (!response.ok) {
                    throw new Error('Error al crear el pedido');
                }

                return await response.json();
            }

            async initializeWompiWidget(orderData) {
                const { pedido, transaccion } = orderData.data;

                const checkout = new WidgetCheckout({
                    currency: 'COP',
                    amountInCents: Math.round(pedido.total * 100),
                    reference: transaccion.referencia,
                    publicKey: 'pub_test_your_public_key', // Tu public key de Wompi
                    redirectUrl: `${window.location.origin}/payment-success?ref=${transaccion.referencia}`,
                    taxInCents: {
                        vat: 0,
                        consumption: 0
                    }
                });

                checkout.open((result) => {
                    this.handleWompiResponse(result, transaccion.id);
                });
            }

            async handleWompiResponse(result, transactionId) {
                if (result.transaction && result.transaction.status === 'APPROVED') {
                    this.showSuccess('¡Pago aprobado! Redirigiendo...');
                    
                    // Verificar estado en nuestro backend
                    setTimeout(() => {
                        window.location.href = `/payment-success?id=${transactionId}`;
                    }, 2000);
                    
                } else if (result.transaction && result.transaction.status === 'DECLINED') {
                    this.showError('Pago rechazado. Por favor intenta con otra tarjeta.');
                    
                } else {
                    this.showError('Pago cancelado o error en la transacción.');
                }
            }

            setLoading(isLoading) {
                const loadingEl = document.getElementById('loading');
                const payBtn = document.getElementById('payBtn');
                
                if (isLoading) {
                    loadingEl.style.display = 'block';
                    payBtn.disabled = true;
                } else {
                    loadingEl.style.display = 'none';
                    payBtn.disabled = false;
                }
            }

            showError(message) {
                document.getElementById('errorMsg').textContent = message;
                document.getElementById('successMsg').textContent = '';
            }

            showSuccess(message) {
                document.getElementById('successMsg').textContent = message;
                document.getElementById('errorMsg').textContent = '';
            }

            clearMessages() {
                document.getElementById('errorMsg').textContent = '';
                document.getElementById('successMsg').textContent = '';
            }
        }

        // Inicializar cuando se carga la página
        document.addEventListener('DOMContentLoaded', () => {
            new WompiPayment();
        });
    </script>
</body>
</html>
```

---

## ⚛️ React.js

### Componente de Pago con Hooks

```jsx
import React, { useState, useEffect } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ orderData }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        orderTotal: orderData?.total || 0
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Cargar script de Wompi
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const { customerName, customerEmail, customerPhone, orderTotal } = formData;
        
        if (!customerName || !customerEmail || !customerPhone || !orderTotal) {
            setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
            return false;
        }
        
        if (orderTotal < 1) {
            setMessage({ type: 'error', text: 'El monto debe ser mayor a $1' });
            return false;
        }
        
        return true;
    };

    const createOrderWithPayment = async () => {
        const response = await fetch('/api/orders/create-with-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                total: formData.orderTotal,
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone,
                items: orderData?.items || [
                    {
                        name: "Pizza Especial",
                        quantity: 1,
                        price: formData.orderTotal
                    }
                ],
                payment_method: 'wompi_3ds'
            })
        });

        if (!response.ok) {
            throw new Error('Error al crear el pedido');
        }

        return await response.json();
    };

    const initializeWompiWidget = (orderData) => {
        const { pedido, transaccion } = orderData.data;

        const checkout = new window.WidgetCheckout({
            currency: 'COP',
            amountInCents: Math.round(pedido.total * 100),
            reference: transaccion.referencia,
            publicKey: process.env.REACT_APP_WOMPI_PUBLIC_KEY,
            redirectUrl: `${window.location.origin}/payment-success?ref=${transaccion.referencia}`,
            taxInCents: {
                vat: 0,
                consumption: 0
            }
        });

        checkout.open((result) => {
            handleWompiResponse(result, transaccion.id);
        });
    };

    const handleWompiResponse = (result, transactionId) => {
        if (result.transaction && result.transaction.status === 'APPROVED') {
            setMessage({ type: 'success', text: '¡Pago aprobado! Redirigiendo...' });
            
            setTimeout(() => {
                window.location.href = `/payment-success?id=${transactionId}`;
            }, 2000);
            
        } else if (result.transaction && result.transaction.status === 'DECLINED') {
            setMessage({ type: 'error', text: 'Pago rechazado. Por favor intenta con otra tarjeta.' });
            
        } else {
            setMessage({ type: 'error', text: 'Pago cancelado o error en la transacción.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const orderData = await createOrderWithPayment();
            initializeWompiWidget(orderData);
            
        } catch (error) {
            console.error('Error en el pago:', error);
            setMessage({ type: 'error', text: 'Error al procesar el pago: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-form">
            <h1>🍕 Finalizar Pago - Mama Mian Pizza</h1>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="customerName">Nombre Completo:</label>
                    <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="customerEmail">Email:</label>
                    <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="customerPhone">Teléfono:</label>
                    <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="orderTotal">Total del Pedido:</label>
                    <input
                        type="number"
                        id="orderTotal"
                        name="orderTotal"
                        value={formData.orderTotal}
                        onChange={handleInputChange}
                        step="0.01"
                        min="1"
                        required
                    />
                </div>
                
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                
                {loading && (
                    <div className="loading">
                        <p>Procesando pago... ⏳</p>
                    </div>
                )}
                
                <button type="submit" className="btn" disabled={loading}>
                    💳 Pagar con Wompi
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;
```

### Hook personalizado para Wompi

```jsx
// hooks/useWompiPayment.js
import { useState, useCallback } from 'react';

export const useWompiPayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const processPayment = useCallback(async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            // Crear pedido
            const response = await fetch('/api/orders/create-with-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...paymentData,
                    payment_method: 'wompi_3ds'
                })
            });

            if (!response.ok) {
                throw new Error('Error al crear el pedido');
            }

            const orderData = await response.json();
            return orderData;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const openWompiWidget = useCallback((orderData, onSuccess, onError) => {
        const { pedido, transaccion } = orderData.data;

        const checkout = new window.WidgetCheckout({
            currency: 'COP',
            amountInCents: Math.round(pedido.total * 100),
            reference: transaccion.referencia,
            publicKey: process.env.REACT_APP_WOMPI_PUBLIC_KEY,
            redirectUrl: `${window.location.origin}/payment-success?ref=${transaccion.referencia}`,
            taxInCents: {
                vat: 0,
                consumption: 0
            }
        });

        checkout.open((result) => {
            if (result.transaction && result.transaction.status === 'APPROVED') {
                onSuccess(result, transaccion.id);
            } else {
                onError(result);
            }
        });
    }, []);

    return {
        loading,
        error,
        processPayment,
        openWompiWidget
    };
};
```

---

## 🟢 Vue.js

### Componente Vue 3 con Composition API

```vue
<template>
  <div class="payment-form">
    <h1>🍕 Finalizar Pago - Mama Mian Pizza</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="customerName">Nombre Completo:</label>
        <input
          v-model="formData.customerName"
          type="text"
          id="customerName"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="customerEmail">Email:</label>
        <input
          v-model="formData.customerEmail"
          type="email"
          id="customerEmail"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="customerPhone">Teléfono:</label>
        <input
          v-model="formData.customerPhone"
          type="tel"
          id="customerPhone"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="orderTotal">Total del Pedido:</label>
        <input
          v-model="formData.orderTotal"
          type="number"
          id="orderTotal"
          step="0.01"
          min="1"
          required
        />
      </div>
      
      <div v-if="message.text" :class="`message ${message.type}`">
        {{ message.text }}
      </div>
      
      <div v-if="loading" class="loading">
        <p>Procesando pago... ⏳</p>
      </div>
      
      <button type="submit" class="btn" :disabled="loading">
        💳 Pagar con Wompi
      </button>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'PaymentForm',
  props: {
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const formData = reactive({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      orderTotal: props.orderData?.total || 0
    })
    
    const loading = ref(false)
    const message = reactive({ type: '', text: '' })

    onMounted(() => {
      // Cargar script de Wompi
      const script = document.createElement('script')
      script.src = 'https://checkout.wompi.co/widget.js'
      script.async = true
      document.body.appendChild(script)
    })

    const validateForm = () => {
      const { customerName, customerEmail, customerPhone, orderTotal } = formData
      
      if (!customerName || !customerEmail || !customerPhone || !orderTotal) {
        message.type = 'error'
        message.text = 'Por favor completa todos los campos'
        return false
      }
      
      if (orderTotal < 1) {
        message.type = 'error'
        message.text = 'El monto debe ser mayor a $1'
        return false
      }
      
      return true
    }

    const createOrderWithPayment = async () => {
      const response = await fetch('/api/orders/create-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total: formData.orderTotal,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          items: props.orderData?.items || [
            {
              name: "Pizza Especial",
              quantity: 1,
              price: formData.orderTotal
            }
          ],
          payment_method: 'wompi_3ds'
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear el pedido')
      }

      return await response.json()
    }

    const initializeWompiWidget = (orderData) => {
      const { pedido, transaccion } = orderData.data

      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: Math.round(pedido.total * 100),
        reference: transaccion.referencia,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
        redirectUrl: `${window.location.origin}/payment-success?ref=${transaccion.referencia}`,
        taxInCents: {
          vat: 0,
          consumption: 0
        }
      })

      checkout.open((result) => {
        handleWompiResponse(result, transaccion.id)
      })
    }

    const handleWompiResponse = (result, transactionId) => {
      if (result.transaction && result.transaction.status === 'APPROVED') {
        message.type = 'success'
        message.text = '¡Pago aprobado! Redirigiendo...'
        
        setTimeout(() => {
          window.location.href = `/payment-success?id=${transactionId}`
        }, 2000)
        
      } else if (result.transaction && result.transaction.status === 'DECLINED') {
        message.type = 'error'
        message.text = 'Pago rechazado. Por favor intenta con otra tarjeta.'
        
      } else {
        message.type = 'error'
        message.text = 'Pago cancelado o error en la transacción.'
      }
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      loading.value = true
      message.type = ''
      message.text = ''

      try {
        const orderData = await createOrderWithPayment()
        initializeWompiWidget(orderData)
        
      } catch (error) {
        console.error('Error en el pago:', error)
        message.type = 'error'
        message.text = 'Error al procesar el pago: ' + error.message
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      loading,
      message,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* Mismos estilos CSS del ejemplo Vanilla JS */
</style>
```

---

## 🅰️ Angular

### Componente Angular con TypeScript

```typescript
// payment.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderTotal: number;
}

interface Message {
  type: 'success' | 'error' | '';
  text: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @Input() orderData: any = {};

  formData: FormData = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderTotal: 0
  };

  loading = false;
  message: Message = { type: '', text: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.formData.orderTotal = this.orderData?.total || 0;
    this.loadWompiScript();
  }

  private loadWompiScript(): void {
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }

  validateForm(): boolean {
    const { customerName, customerEmail, customerPhone, orderTotal } = this.formData;
    
    if (!customerName || !customerEmail || !customerPhone || !orderTotal) {
      this.setMessage('error', 'Por favor completa todos los campos');
      return false;
    }
    
    if (orderTotal < 1) {
      this.setMessage('error', 'El monto debe ser mayor a $1');
      return false;
    }
    
    return true;
  }

  async createOrderWithPayment(): Promise<any> {
    const payload = {
      total: this.formData.orderTotal,
      customer_name: this.formData.customerName,
      customer_email: this.formData.customerEmail,
      customer_phone: this.formData.customerPhone,
      items: this.orderData?.items || [
        {
          name: "Pizza Especial",
          quantity: 1,
          price: this.formData.orderTotal
        }
      ],
      payment_method: 'wompi_3ds'
    };

    return this.http.post(`${environment.apiUrl}/orders/create-with-payment`, payload).toPromise();
  }

  initializeWompiWidget(orderData: any): void {
    const { pedido, transaccion } = orderData.data;

    const checkout = new window.WidgetCheckout({
      currency: 'COP',
      amountInCents: Math.round(pedido.total * 100),
      reference: transaccion.referencia,
      publicKey: environment.wompiPublicKey,
      redirectUrl: `${window.location.origin}/payment-success?ref=${transaccion.referencia}`,
      taxInCents: {
        vat: 0,
        consumption: 0
      }
    });

    checkout.open((result: any) => {
      this.handleWompiResponse(result, transaccion.id);
    });
  }

  handleWompiResponse(result: any, transactionId: string): void {
    if (result.transaction && result.transaction.status === 'APPROVED') {
      this.setMessage('success', '¡Pago aprobado! Redirigiendo...');
      
      setTimeout(() => {
        window.location.href = `/payment-success?id=${transactionId}`;
      }, 2000);
      
    } else if (result.transaction && result.transaction.status === 'DECLINED') {
      this.setMessage('error', 'Pago rechazado. Por favor intenta con otra tarjeta.');
      
    } else {
      this.setMessage('error', 'Pago cancelado o error en la transacción.');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;

    this.loading = true;
    this.clearMessage();

    try {
      const orderData = await this.createOrderWithPayment();
      this.initializeWompiWidget(orderData);
      
    } catch (error) {
      console.error('Error en el pago:', error);
      this.setMessage('error', 'Error al procesar el pago: ' + (error as Error).message);
    } finally {
      this.loading = false;
    }
  }

  private setMessage(type: 'success' | 'error', text: string): void {
    this.message = { type, text };
  }

  private clearMessage(): void {
    this.message = { type: '', text: '' };
  }
}
```

```html
<!-- payment.component.html -->
<div class="payment-form">
  <h1>🍕 Finalizar Pago - Mama Mian Pizza</h1>
  
  <form (ngSubmit)="onSubmit()" #paymentForm="ngForm">
    <div class="form-group">
      <label for="customerName">Nombre Completo:</label>
      <input
        type="text"
        id="customerName"
        [(ngModel)]="formData.customerName"
        name="customerName"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="customerEmail">Email:</label>
      <input
        type="email"
        id="customerEmail"
        [(ngModel)]="formData.customerEmail"
        name="customerEmail"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="customerPhone">Teléfono:</label>
      <input
        type="tel"
        id="customerPhone"
        [(ngModel)]="formData.customerPhone"
        name="customerPhone"
        required
      />
    </div>
    
    <div class="form-group">
      <label for="orderTotal">Total del Pedido:</label>
      <input
        type="number"
        id="orderTotal"
        [(ngModel)]="formData.orderTotal"
        name="orderTotal"
        step="0.01"
        min="1"
        required
      />
    </div>
    
    <div *ngIf="message.text" [ngClass]="'message ' + message.type">
      {{ message.text }}
    </div>
    
    <div *ngIf="loading" class="loading">
      <p>Procesando pago... ⏳</p>
    </div>
    
    <button type="submit" class="btn" [disabled]="loading">
      💳 Pagar con Wompi
    </button>
  </form>
</div>
```

---

## 🔄 Flujo Completo de Integración

### 1. Variables de Entorno

```bash
# Frontend (.env)
REACT_APP_WOMPI_PUBLIC_KEY=pub_test_your_public_key
REACT_APP_API_URL=https://api.mamamianpizza.com/api

# Vue (.env)
VITE_WOMPI_PUBLIC_KEY=pub_test_your_public_key
VITE_API_URL=https://api.mamamianpizza.com/api

# Angular (environment.ts)
export const environment = {
  production: false,
  wompiPublicKey: 'pub_test_your_public_key',
  apiUrl: 'https://api.mamamianpizza.com/api'
};
```

### 2. Página de Éxito del Pago

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Exitoso - Mama Mian Pizza</title>
    <style>
        .success-page {
            max-width: 600px;
            margin: 50px auto;
            text-align: center;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .success-icon {
            font-size: 72px;
            margin-bottom: 20px;
        }
        .order-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .btn {
            background-color: #27ae60;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }
    </style>
</head>
<body>
    <div class="success-page">
        <div class="success-icon">✅</div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pago ha sido procesado correctamente.</p>
        
        <div class="order-details" id="orderDetails">
            <h3>Detalles del Pedido</h3>
            <p>Cargando información...</p>
        </div>
        
        <a href="/" class="btn">🏠 Volver al Inicio</a>
        <a href="/orders" class="btn">📋 Ver Mis Pedidos</a>
    </div>

    <script>
        // Obtener información del pedido
        const urlParams = new URLSearchParams(window.location.search);
        const transactionId = urlParams.get('id');
        const reference = urlParams.get('ref');
        
        if (transactionId) {
            fetch(`/api/payments/status/${transactionId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const order = data.data;
                        document.getElementById('orderDetails').innerHTML = `
                            <h3>Detalles del Pedido</h3>
                            <p><strong>Número de Pedido:</strong> ${order.id}</p>
                            <p><strong>Total:</strong> $${order.total}</p>
                            <p><strong>Estado:</strong> ${order.estado}</p>
                            <p><strong>Fecha:</strong> ${new Date(order.fecha_creacion).toLocaleString()}</p>
                        `;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('orderDetails').innerHTML = `
                        <h3>Error</h3>
                        <p>No se pudo cargar la información del pedido.</p>
                    `;
                });
        }
    </script>
</body>
</html>
```

---

## ⚠️ Manejo de Errores

### Errores Comunes y Soluciones

```javascript
class PaymentErrorHandler {
    static handleWompiError(error, result) {
        switch (error.type || result.transaction?.status) {
            case 'DECLINED':
                return {
                    message: 'Pago rechazado. Verifica los datos de tu tarjeta.',
                    action: 'retry'
                };
            
            case 'EXPIRED':
                return {
                    message: 'La sesión de pago ha expirado. Intenta nuevamente.',
                    action: 'restart'
                };
            
            case 'INSUFFICIENT_FUNDS':
                return {
                    message: 'Fondos insuficientes en la tarjeta.',
                    action: 'change_card'
                };
            
            case 'INVALID_CARD':
                return {
                    message: 'Tarjeta inválida. Verifica el número y fecha.',
                    action: 'retry'
                };
            
            case 'NETWORK_ERROR':
                return {
                    message: 'Error de conexión. Verifica tu internet.',
                    action: 'retry'
                };
            
            default:
                return {
                    message: 'Error inesperado. Contacta soporte si persiste.',
                    action: 'contact_support'
                };
        }
    }

    static async retryPayment(originalData, maxRetries = 3) {
        let attempts = 0;
        
        while (attempts < maxRetries) {
            try {
                const result = await this.processPayment(originalData);
                return result;
            } catch (error) {
                attempts++;
                
                if (attempts >= maxRetries) {
                    throw new Error(`Pago falló después de ${maxRetries} intentos: ${error.message}`);
                }
                
                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }
    }
}
```

---

## 🚀 Configuración de Producción

### Variables de Entorno de Producción

```bash
# Producción
WOMPI_PUBLIC_KEY=pub_prod_your_production_key
WOMPI_PRIVATE_KEY=prv_prod_your_production_key
API_URL=https://api.mamamianpizza.com/api

# Desarrollo
WOMPI_PUBLIC_KEY=pub_test_your_test_key
WOMPI_PRIVATE_KEY=prv_test_your_test_key
API_URL=http://localhost:3000/api
```

### Tarjetas de Prueba Wompi

```javascript
const testCards = {
    approved: {
        number: '4242424242424242',
        expiry: '12/25',
        cvc: '123',
        name: 'Test User'
    },
    declined: {
        number: '4000000000000002',
        expiry: '12/25',
        cvc: '123',
        name: 'Test User'
    },
    insufficient_funds: {
        number: '4000000000009995',
        expiry: '12/25',
        cvc: '123',
        name: 'Test User'
    }
};
```

---

## 📱 Responsive y Móvil

### CSS Responsive

```css
/* Mobile First Approach */
.payment-form {
    max-width: 100%;
    padding: 15px;
    margin: 0 auto;
}

@media (min-width: 768px) {
    .payment-form {
        max-width: 600px;
        padding: 30px;
    }
}

.form-group {
    margin-bottom: 20px;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px; /* Evita zoom en iOS */
    box-sizing: border-box;
}

.btn {
    width: 100%;
    padding: 15px;
    font-size: 18px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(45deg, #e74c3c, #c0392b);
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Loading Animation */
.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
}

.loading::before {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #e74c3c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## 🎯 Próximos Pasos

1. **Configura las variables de entorno** con tus keys de Wompi
2. **Implementa el frontend** usando el framework de tu preferencia
3. **Prueba con tarjetas de test** antes de producción
4. **Configura el webhook** en el dashboard de Wompi
5. **Implementa logging** para monitorear transacciones
6. **Añade analytics** para seguimiento de conversiones

¿Con qué framework quieres que profundicemos más? 🚀
