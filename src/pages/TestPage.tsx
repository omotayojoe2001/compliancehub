export default function TestPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ color: 'green', fontSize: '32px' }}>✅ TEST PAGE WORKS!</h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        This is a simple test page to verify routing is working correctly.
      </p>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', border: '2px solid #007bff', borderRadius: '8px' }}>
        <h2>Route Test Successful</h2>
        <p>If you can see this page, the routing system is working properly.</p>
      </div>
    </div>
  );
}