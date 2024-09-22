import Layout from './components/Layout';
import '../app/globals.css';

export default function Page() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl text-white">Welcome to Your Dashboard</h1>
        {/* Add more content and components here */}
      </div>
    </Layout>
  );
}