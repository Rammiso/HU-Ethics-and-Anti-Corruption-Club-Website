import { Routes, Route } from 'react-router-dom';

// Placeholder components - to be implemented
const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Events = () => <div>Events Page</div>;
const News = () => <div>News Page</div>;
const AnonymousReport = () => <div>Anonymous Report Page</div>;
const ReportTracking = () => <div>Report Tracking Page</div>;
const Contact = () => <div>Contact Page</div>;
const Resources = () => <div>Resources Page</div>;

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/events" element={<Events />} />
      <Route path="/news" element={<News />} />
      <Route path="/report" element={<AnonymousReport />} />
      <Route path="/track" element={<ReportTracking />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/resources" element={<Resources />} />
    </Routes>
  );
}

export default PublicRoutes;
