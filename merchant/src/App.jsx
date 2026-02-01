import { useState } from 'react'
import './App.css'

function App() {
  const paymentMethods = [
    {
      key: 'card',
      label: 'Card',
      description: 'Visa, MasterCard, RuPay & More',
      icon: '💳',
      badges: ['VISA', 'MC']
    },
    {
      key: 'upi',
      label: 'UPI / QR',
      description: 'GPay, PhonePe, Paytm & More',
      icon: '📱',
      badges: ['GPay', 'PhonePe']
    },
    {
      key: 'netbanking',
      label: 'Netbanking',
      description: 'All Indian Banks',
      icon: '🏦',
      badges: ['SBI', 'HDFC']
    },
    {
      key: 'wallet',
      label: 'Wallet',
      description: 'PhonePe, Paytm & More',
      icon: '👛',
      badges: ['PhonePe', 'Amazon']
    },
    {
      key: 'emi',
      label: 'EMI',
      description: 'EMI via Debit/Credit cards & More',
      icon: '💰',
      badges: ['0% EMI', 'No Cost']
    },
    {
      key: 'paylater',
      label: 'Pay Later',
      description: 'LazyPay, Simpl, FlexiPay',
      icon: '⏰',
      badges: ['Simpl', 'LazyPay']
    }
  ]

  const banks = [
    { name: 'SBI', icon: '🏛️' },
    { name: 'ICICI', icon: '🏛️' },
    { name: 'Axis', icon: '🔺' },
    { name: 'Kotak', icon: '🔴' },
    { name: 'Yes Bank', icon: '✓' },
    { name: 'IDBI', icon: '🏛️' }
  ]
  
  const walletOptions = [
    { name: 'PhonePe', subtitle: 'Link & Pay', icon: '📱' },
    { name: 'Paytm', subtitle: 'Link & Pay', icon: '💰' },
    { name: 'Amazon Pay', subtitle: 'Link & Pay', icon: '🛒' },
    { name: 'MobiKwik', subtitle: 'Link & Pay', icon: '💳' },
    { name: 'Freecharge', subtitle: 'Link & Pay', icon: '⚡' },
    { name: 'Airtel Money', subtitle: 'Link & Pay', icon: '📞' }
  ]
  
  const emiPlans = [
    { months: 3, bank: 'HDFC', emi: 2040.13, interest: '12%' },
    { months: 6, bank: 'ICICI', emi: 1038.26, interest: '13%' },
    { months: 9, bank: 'Axis', emi: 706.16, interest: '14%' },
    { months: 12, bank: 'SBI', emi: 541.55, interest: '15%' },
    { months: 18, bank: 'Kotak', emi: 377.14, interest: '16%' },
    { months: 24, bank: 'Yes Bank', emi: 299.54, interest: '18%' }
  ]
  
  const payLaterOptions = [
    { name: 'Simpl', subtitle: 'Pay in 2 weeks', icon: '💎' },
    { name: 'LazyPay', subtitle: 'Pay next month', icon: '😴' },
    { name: 'ZestMoney', subtitle: 'EMI options available', icon: '💸' },
    { name: 'FlexiPay', subtitle: 'Flexible payments', icon: '🔄' }
  ]

  const [selectedMethod, setSelectedMethod] = useState('card')
  const [selectedBank, setSelectedBank] = useState('SBI')
  const [selectedPayLaterOption, setSelectedPayLaterOption] = useState('Simpl')
  const [step, setStep] = useState('setup')
  const [merchantName, setMerchantName] = useState('SlayPay Merchant')
  const [amount, setAmount] = useState(6767.67)
  const [contact, setContact] = useState({
    name: 'Avni Sethi',
    phone: '+91 8657305445',
    email: 'avni@slaypay.com'
  })
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    name: '',
    cvv: ''
  })
  const [upiId, setUpiId] = useState('')
  const [upiTab, setUpiTab] = useState('scan')
  const [selectedEmiPlan, setSelectedEmiPlan] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('PhonePe')
  const [processingStep, setProcessingStep] = useState(0)
  const [transactionId, setTransactionId] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [paymentStatus, setPaymentStatus] = useState('success') // Track if payment succeeded or failed
  const [generatingTraffic, setGeneratingTraffic] = useState(false)
  const [trafficSummary, setTrafficSummary] = useState(null)

  const handleGenerateTraffic = async () => {
    setGeneratingTraffic(true)
    setTrafficSummary(null)
    
    try {
      const response = await fetch('http://localhost:3001/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1000 })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTrafficSummary(data)
        console.log('✓ Generated traffic:', data.generated, 'events')
        setTimeout(() => setTrafficSummary(null), 8000) // Clear after 8 seconds
      }
    } catch (error) {
      console.error('✗ Failed to generate traffic:', error)
      setStatus({ type: 'error', message: 'Failed to generate traffic' })
    } finally {
      setGeneratingTraffic(false)
    }
  }

  const handlePay = async () => {
    setStep('processing')
    setProcessingStep(0)
    
    // Generate transaction ID
    const txnId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 10000)
    setTransactionId(txnId)
    
    // Animate through steps
    setTimeout(() => setProcessingStep(1), 800)
    setTimeout(() => setProcessingStep(2), 1600)
    setTimeout(() => setProcessingStep(3), 2400)
    setTimeout(() => setProcessingStep(4), 3200)
    
    // Simulate payment (80% success, 20% failure)
    const willSucceed = Math.random() > 0.2
    const latency = willSucceed 
      ? Math.floor(Math.random() * 300) + 100 
      : Math.floor(Math.random() * 500) + 200
    
    const errorCodes = ['BANK_TIMEOUT', 'INSUFFICIENT_FUNDS', 'INVALID_CARD', 'NETWORK_ERROR']
    const paymentEvent = {
      transaction_id: txnId,
      timestamp: new Date().toISOString(),
      user_id: contact.email || 'guest',
      amount: amount,
      bank: selectedMethod === 'netbanking' ? selectedBank : (selectedMethod === 'card' ? 'HDFC' : 'SBI'),
      method: selectedMethod === 'card' ? 'Card' : 
              selectedMethod === 'upi' ? 'UPI' : 
              selectedMethod === 'netbanking' ? 'Netbanking' : 
              selectedMethod === 'wallet' ? 'Wallet' : 
              selectedMethod === 'emi' ? 'Card' : 
              'UPI',
      status: willSucceed ? 'success' : 'failure',
      latency: latency,
      error_code: willSucceed ? null : errorCodes[Math.floor(Math.random() * errorCodes.length)]
    }
    
    setPaymentStatus(paymentEvent.status)
    
    // Send to backend
    try {
      await fetch('http://localhost:3001/payments/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentEvent)
      })
      console.log('✓ Payment event sent to backend:', paymentEvent)
    } catch (error) {
      console.error('✗ Failed to send payment to backend:', error)
    }
    
    setTimeout(() => setStep('success'), 4000)
  }

  const handleResetStatus = () => {
    setStatus({ type: 'idle', message: '' })
  }

  const handleStart = () => {
    setStep('contact')
  }

  return (
    <div className="app">
      {step === 'setup' ? (
        <div className="welcome">
          <div className="welcome-hero">
            <h1>
              Welcome to <span className="slay">Slay</span><span className="pay">Pay</span>
            </h1>
            <p>
              Experience a complete payment gateway simulation. Test all payment methods including Cards, UPI, Netbanking, Wallets, EMI, and Pay Later.
            </p>
          </div>

          <div className="welcome-card">
            <h2>Configure Payment</h2>
            <div className="form-group">
              <label className="field-label">Merchant Name</label>
              <input
                className="field-input"
                value={merchantName}
                onChange={(event) => setMerchantName(event.target.value)}
                placeholder="SlayPay"
              />
            </div>
            <div className="form-group">
              <label className="field-label">Amount (INR)</label>
              <input
                className="field-input"
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                placeholder="1000"
              />
            </div>
            <button className="pay-button" onClick={handleStart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Pay ₹{amount.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      ) : step === 'contact' ? (
        <div className="gateway">
        <aside className="gateway-left">
          <div className="merchant-header">
            <div className="merchant-avatar">
              {merchantName ? merchantName[0].toUpperCase() : 'M'}
            </div>
            <h2 className="merchant-name">{merchantName || 'Merchant'}</h2>
          </div>

          <div className="trusted-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z" fill="currentColor"/>
            </svg>
            SlayPay Trusted Business
          </div>

          <div className="amount-card">
            <span className="amount-label">Total Amount</span>
            <div className="amount-value">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <button className="using-as" onClick={() => setStep('setup')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Using as {contact.phone}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <div className="sidebar-decoration">
            <div className="decoration-shape"></div>
          </div>

          <div className="secured">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z" fill="#ffd700"/>
            </svg>
            Secured by <strong>SlayPay</strong>
          </div>
        </aside>

        <section className="gateway-right">
          <div className="contact-header">
            <h2>Contact Details</h2>
            <div className="header-actions">
              <button 
                className="icon-btn" 
                onClick={handleGenerateTraffic}
                disabled={generatingTraffic}
                style={{
                  background: generatingTraffic ? '#6b7280' : '#c91219',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  width: 'auto',
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: generatingTraffic ? 'not-allowed' : 'pointer',
                  opacity: generatingTraffic ? 0.6 : 1
                }}
              >
                {generatingTraffic ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="gold" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    Generate Test Traffic
                  </>
                )}
              </button>
              <button className="icon-btn" onClick={handleResetStatus}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
              <button className="icon-btn" onClick={() => setStep('setup')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              <button className="icon-btn" onClick={() => setStep('setup')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="contact-form">
            <label className="form-label">
              Phone Number
              <div className="phone-input">
                <div className="country-code">+91</div>
                <input
                  type="tel"
                  value={contact.phone.replace('+91 ', '')}
                  onChange={(event) =>
                    setContact({ ...contact, phone: '+91 ' + event.target.value })
                  }
                  placeholder="8657305445"
                />
              </div>
            </label>

            <label className="form-label">
              Email Address
              <input
                type="email"
                value={contact.email}
                onChange={(event) =>
                  setContact({ ...contact, email: event.target.value })
                }
                placeholder="your.email@example.com"
              />
            </label>

            <button className="proceed-btn" onClick={() => setStep('methods')}>
              Proceed
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <p className="terms">
              By proceeding, you agree to SlayPay's Terms of Service and Privacy Policy
            </p>
          </div>

          {status.type !== 'idle' && (
            <div className={`status-banner ${status.type}`}>
              {status.message}
            </div>
          )}

          {trafficSummary && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, #c91219 0%, #8b0d12 100%)',
              color: 'white',
              padding: '20px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(201, 18, 25, 0.3)',
              zIndex: 10000,
              minWidth: '320px',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                  Traffic Generated Successfully
                </h3>
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '24px', display: 'block', color: '#ffd700' }}>
                    {trafficSummary.generated.toLocaleString()}
                  </strong>
                  <span style={{ opacity: 0.8 }}>payment events generated</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <div>✓ Success: {trafficSummary.summary.success}</div>
                  <div>✗ Failure: {trafficSummary.summary.failure}</div>
                  <div>↻ Retried: {trafficSummary.summary.retried}</div>
                  <div>⊘ Cancelled: {trafficSummary.summary.cancelled}</div>
                  {trafficSummary.summary.bounced > 0 && (
                    <div>⟲ Bounced: {trafficSummary.summary.bounced}</div>
                  )}
                </div>
                <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.7 }}>
                  Check the Ops Dashboard to see live updates
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    ) : step === 'methods' ? (
        <div className="gateway">
        <aside className="gateway-left">
          <div className="merchant-header">
            <div className="merchant-avatar">
              {merchantName ? merchantName[0].toUpperCase() : 'M'}
            </div>
            <h2 className="merchant-name">{merchantName || 'Merchant'}</h2>
          </div>

          <div className="trusted-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z" fill="currentColor"/>
            </svg>
            SlayPay Trusted Business
          </div>

          <div className="amount-card">
            <span className="amount-label">Total Amount</span>
            <div className="amount-value">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <button className="using-as" onClick={() => setStep('contact')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Using as {contact.phone}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <div className="sidebar-decoration">
            <div className="decoration-shape"></div>
          </div>

          <div className="secured">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z" fill="#ffd700"/>
            </svg>
            Secured by <strong>SlayPay</strong>
          </div>
        </aside>

        <section className="gateway-right">
          <div className="methods-header">
            <button className="back-btn" onClick={() => setStep('contact')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="header-merchant">
              <div className="header-avatar">
                {merchantName ? merchantName[0].toUpperCase() : 'M'}
              </div>
              <div>
                <h3>{merchantName || 'Merchant'}</h3>
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#c91219">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  SlayPay Trusted Business
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
              </button>
              <button className="icon-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              <button className="icon-btn" onClick={() => setStep('setup')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="methods-content">
            <h2 className="methods-title">Cards, UPI & More</h2>
            
            <div className="payment-methods-list">
              {paymentMethods.map((method) => (
                <button
                  key={method.key}
                  className="payment-method-item"
                  onClick={() => {
                    setSelectedMethod(method.key)
                    setStep('payment')
                  }}
                >
                  <div className="method-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c91219" strokeWidth="2">
                      {method.key === 'card' && <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>}
                      {method.key === 'upi' && <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>}
                      {method.key === 'netbanking' && <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>}
                      {method.key === 'wallet' && <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />}
                      {method.key === 'emi' && <circle cx="12" cy="12" r="10"/>}
                      {method.key === 'paylater' && <circle cx="12" cy="12" r="10"/>}
                    </svg>
                  </div>
                  <div className="method-info">
                    <h4>{method.label}</h4>
                    <p>{method.description}</p>
                  </div>
                  <div className="method-badges">
                    {method.badges.map((badge, idx) => (
                      <span key={idx} className="method-badge">{badge}</span>
                    ))}
                  </div>
                  <svg className="method-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>

            <div className="methods-footer">
              <div className="footer-total">
                <span>Total</span>
                <strong>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <button className="view-details" onClick={() => setStep('setup')}>
                View Details
              </button>
            </div>
          </div>

          {status.type !== 'idle' && (
            <div className={`status-banner ${status.type}`}>
              {status.message}
            </div>
          )}
        </section>
      </div>
    ) : step === 'payment' ? (
        <div className="gateway">
        <aside className="gateway-left">
          <div className="merchant-header">
            <div className="merchant-avatar">
              {merchantName ? merchantName[0].toUpperCase() : 'M'}
            </div>
            <h2 className="merchant-name">{merchantName || 'Merchant'}</h2>
          </div>

          <div className="trusted-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z" fill="currentColor"/>
            </svg>
            SlayPay Trusted Business
          </div>

          <div className="amount-card">
            <span className="amount-label">Total Amount</span>
            <div className="amount-value">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <button className="using-as" onClick={() => setStep('contact')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Using as {contact.phone}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <div className="sidebar-decoration">
            <div className="decoration-shape"></div>
          </div>

          <div className="secured">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z" fill="#ffd700"/>
            </svg>
            Secured by <strong>SlayPay</strong>
          </div>
        </aside>

        <section className="gateway-right">
          <div className="methods-header">
            <button className="back-btn" onClick={() => setStep('methods')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="header-merchant">
              <div className="header-avatar">
                {merchantName ? merchantName[0].toUpperCase() : 'M'}
              </div>
              <div>
                <h3>{merchantName || 'Merchant'}</h3>
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#c91219">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  SlayPay Trusted Business
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
              </button>
              <button className="icon-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              <button className="icon-btn" onClick={() => setStep('setup')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="payment-content">
            {selectedMethod === 'card' && (
              <div className="payment-form">
                <h2 className="payment-title">Card Payment</h2>
                
                <div className="form-group">
                  <label className="field-label">Card Number</label>
                  <div className="card-input">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5e54" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    <input
                      className="field-input"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label">Card Holder Name</label>
                  <input
                    className="field-input"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="Name on card"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="field-label">Expiry Date</label>
                    <input
                      className="field-input"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label className="field-label">
                      CVV
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </label>
                    <div className="cvv-input">
                      <input
                        className="field-input"
                        type="password"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                        placeholder="•••"
                        maxLength="3"
                      />
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b5e54" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="security-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b5e54" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Your card details are encrypted and secure
                </div>

                <button className="pay-button-large" onClick={handlePay}>
                  Pay ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              </div>
            )}

            {selectedMethod === 'upi' && (
              <div className="payment-form">
                <h2 className="payment-title">UPI Payment</h2>
                
                <div className="upi-tabs">
                  <button
                    className={upiTab === 'scan' ? 'upi-tab active' : 'upi-tab'}
                    onClick={() => setUpiTab('scan')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                    Scan QR
                  </button>
                  <button
                    className={upiTab === 'id' ? 'upi-tab active' : 'upi-tab'}
                    onClick={() => setUpiTab('id')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    </svg>
                    Enter UPI ID
                  </button>
                </div>

                {upiTab === 'scan' ? (
                  <div className="qr-section">
                    <div className="qr-timer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b5e54" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Expires in 9:00
                    </div>
                    
                    <div className="qr-code">
                      <div className="qr-grid">
                        {Array.from({ length: 196 }).map((_, i) => (
                          <div key={i} className={Math.random() > 0.5 ? 'qr-pixel filled' : 'qr-pixel'}></div>
                        ))}
                        <div className="qr-logo">SP</div>
                      </div>
                    </div>

                    <p className="qr-instruction">Scan with any UPI app</p>

                    <div className="upi-apps">
                      <div className="upi-app" style={{ background: '#e8f5e9' }}>💚</div>
                      <div className="upi-app" style={{ background: '#f3e5f5' }}>💜</div>
                      <div className="upi-app" style={{ background: '#e3f2fd' }}>💙</div>
                      <div className="upi-app" style={{ background: '#fff3e0' }}>🇮🇳</div>
                      <div className="upi-app" style={{ background: '#f5f5f5' }}>🛒</div>
                    </div>

                    <div className="recommended-section">
                      <span className="recommended-label">Recommended</span>
                      <button className="upi-option" onClick={handlePay}>
                        <div className="upi-app-icon" style={{ background: '#e8f5e9' }}>💚</div>
                        UPI - Google Pay
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upi-id-section">
                    <div className="form-group">
                      <label className="field-label">Enter your UPI ID</label>
                      <input
                        className="field-input"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                      />
                    </div>
                    <button className="pay-button-large" onClick={handlePay}>
                      Verify & Pay ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="payment-form">
                <h2 className="payment-title">Select Bank</h2>
                
                <div className="bank-grid-3col">
                  {banks.map((bank) => (
                    <button
                      key={bank.name}
                      className={selectedBank === bank.name ? 'bank-card active' : 'bank-card'}
                      onClick={() => setSelectedBank(bank.name)}
                    >
                      <div className="bank-icon-circle">{bank.icon}</div>
                      <span>{bank.name}</span>
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                  <button className="dropdown-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5e54" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    Select a different bank
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                <button className="pay-button-large" onClick={handlePay}>
                  Pay ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              </div>
            )}

            {selectedMethod === 'wallet' && (
              <div className="payment-form">
                <h2 className="payment-title">Select Wallet</h2>
                
                <div className="wallet-list">
                  {walletOptions.map((wallet) => (
                    <button
                      key={wallet.name}
                      className={selectedWallet === wallet.name ? 'wallet-item selected' : 'wallet-item'}
                      onClick={() => setSelectedWallet(wallet.name)}
                    >
                      <div className="wallet-icon">{wallet.icon}</div>
                      <div className="wallet-info">
                        <h4>{wallet.name}</h4>
                        <p>{wallet.subtitle}</p>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>

                <div className="selected-wallet-section">
                  <span className="selected-label">Selected Wallet</span>
                  <div className="selected-wallet">
                    <div className="wallet-icon-small">📱</div>
                    {selectedWallet}
                  </div>
                </div>

                <button className="pay-button-large" onClick={handlePay}>
                  Pay with {selectedWallet} - ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              </div>
            )}

            {selectedMethod === 'emi' && (
              <div className="payment-form">
                <h2 className="payment-title">EMI Options</h2>
                <p className="payment-subtitle">Choose a convenient EMI plan</p>
                
                <div className="emi-list">
                  {emiPlans.map((plan) => (
                    <button
                      key={plan.months}
                      className={selectedEmiPlan === `${plan.months}` ? 'emi-option selected' : 'emi-option'}
                      onClick={() => setSelectedEmiPlan(`${plan.months}`)}
                    >
                      <div className="emi-radio">
                        <div className="radio-circle">{selectedEmiPlan === `${plan.months}` && <div className="radio-dot"></div>}</div>
                      </div>
                      <div className="emi-info">
                        <h4>{plan.months} Months</h4>
                        <p>{plan.bank}</p>
                      </div>
                      <div className="emi-amount">
                        <strong>₹{plan.emi.toLocaleString('en-IN')}/mo</strong>
                        <span>{plan.interest} p.a.</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="emi-notice">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#c91219">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2"/>
                  </svg>
                  <div>
                    <strong>No Cost EMI Available</strong>
                    <p>On select bank cards</p>
                  </div>
                </div>

                <button className="pay-button-large" onClick={handlePay}>
                  Proceed with EMI
                </button>
              </div>
            )}

            {selectedMethod === 'paylater' && (
              <div className="payment-form">
                <h2 className="payment-title">Pay Later</h2>
                <p className="payment-subtitle">Buy now, pay later with easy options</p>
                
                <div className="paylater-list">
                  {payLaterOptions.map((option) => (
                    <button
                      key={option.name}
                      className={selectedPayLaterOption === option.name ? 'paylater-option selected' : 'paylater-option'}
                      onClick={() => setSelectedPayLaterOption(option.name)}
                    >
                      <div className="emi-radio">
                        <div className="radio-circle">{selectedPayLaterOption === option.name && <div className="radio-dot"></div>}</div>
                      </div>
                      <div className="paylater-icon">{option.icon}</div>
                      <div className="paylater-info">
                        <h4>{option.name}</h4>
                        <p>{option.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="how-it-works">
                  <div className="how-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#c91219">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2"/>
                    </svg>
                    How Pay Later Works
                  </div>
                  <div className="how-steps">
                    <div className="how-step">
                      <span className="step-number">1</span>
                      Select your preferred Pay Later option
                    </div>
                    <div className="how-step">
                      <span className="step-number">2</span>
                      Verify with OTP on registered mobile
                    </div>
                    <div className="how-step">
                      <span className="step-number">3</span>
                      Pay the amount on your next billing date
                    </div>
                  </div>
                </div>

                <button className="pay-button-large" onClick={handlePay}>
                  Continue with Pay Later
                </button>
              </div>
            )}
          </div>

          {status.type !== 'idle' && (
            <div className={`status-banner ${status.type}`}>
              {status.message}
            </div>
          )}
        </section>
      </div>
      ) : null}
      
      {step === 'processing' && (
        <div className="modal-overlay">
          <div className="processing-modal">
            <div className="processing-spinner">
              <div className="spinner-circle"></div>
            </div>
            <h2 className="processing-title">Processing Payment</h2>
            <p className="processing-warning">Please do not close this window or press back</p>
            
            <div className="processing-steps">
              <div className={`step-item ${processingStep >= 1 ? 'completed' : ''}`}>
                <div className="step-icon">
                  {processingStep >= 1 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <div className="step-number">1</div>
                  )}
                </div>
                <span>Verifying payment details...</span>
              </div>
              
              <div className={`step-item ${processingStep >= 2 ? 'completed' : processingStep === 1 ? 'active' : ''}`}>
                <div className="step-icon">
                  {processingStep >= 2 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <div className="step-number">2</div>
                  )}
                </div>
                <span>Connecting to bank...</span>
              </div>
              
              <div className={`step-item ${processingStep >= 3 ? 'completed' : processingStep === 2 ? 'active' : ''}`}>
                <div className="step-icon">
                  {processingStep >= 3 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <div className="step-number">3</div>
                  )}
                </div>
                <span>Processing transaction...</span>
              </div>
              
              <div className={`step-item ${processingStep >= 4 ? 'completed' : processingStep === 3 ? 'active' : ''}`}>
                <div className="step-icon">
                  {processingStep >= 4 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <div className="step-number">4</div>
                  )}
                </div>
                <span>Confirming payment...</span>
              </div>
            </div>
            
            <div className="secured-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b5e54" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secured by
              <div className="slaypay-badge">
                <div className="badge-icon">⚡</div>
                <strong>SlayPay</strong>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {step === 'success' && (
        <div className="success-screen">
          <div className="success-content">
            <div className="success-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={paymentStatus === 'success' ? '#22c55e' : '#ef4444'} strokeWidth="2">
                {paymentStatus === 'success' ? (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </>
                )}
              </svg>
            </div>
            
            <h1 className="success-title">{paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}</h1>
            <p className="success-subtitle">{paymentStatus === 'success' ? 'Your transaction has been completed' : 'Transaction could not be processed'}</p>
            
            <div className="success-amount">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            
            <div className="transaction-details">
              <div className="detail-row">
                <span>Transaction ID</span>
                <strong>{transactionId}</strong>
              </div>
              <div className="detail-row">
                <span>Date & Time</span>
                <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <strong className={paymentStatus === 'success' ? 'status-completed' : 'status-failed'}>{paymentStatus === 'success' ? 'Completed' : 'Failed'}</strong>
              </div>
            </div>
            
            <div className="success-actions">
              <button className="action-btn secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Receipt
              </button>
              <button className="action-btn secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share
              </button>
            </div>
            
            <button className="done-btn" onClick={() => setStep('setup')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              Done
            </button>
            
            <div className="powered-by">
              Powered by
              <div className="slaypay-badge">
                <div className="badge-icon">⚡</div>
                <strong>SlayPay</strong>
              </div>
            </div>
          </div>
          
          <div className="simulator-note">This is a payment gateway simulator</div>
        </div>
      )}
    </div>
  )
}

export default App


