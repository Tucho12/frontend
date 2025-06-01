import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Home = () => {
  const navigate = useNavigate();
const [theme, setTheme] = useState("light");

useEffect(() => {
  document.body.className = theme; // Apply class to body
}, [theme]);

const toggleTheme = () => {
  setTheme((prev) => (prev === "light" ? "dark" : "light"));
};

  const [properties, setProperties] = useState([]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/properties`
        );
        const data = await res.json();
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const [landlordDisplayCount, setLandlordDisplayCount] = useState(0);
  const [tenantDisplayCount, setTenantDisplayCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isCollapsed, setIsCollapsed] = useState(false);


  useEffect(() => {
    let landlordTarget = 15;
    let tenantTarget = 25;

    let landlordInterval = setInterval(() => {
      setLandlordDisplayCount((prev) => {
        if (prev < landlordTarget) return prev + 1;
        clearInterval(landlordInterval);
        return landlordTarget;
      });
    }, 100);

    let tenantInterval = setInterval(() => {
      setTenantDisplayCount((prev) => {
        if (prev < tenantTarget) return prev + 1;
        clearInterval(tenantInterval);
        return tenantTarget;
      });
    }, 100);

    return () => {
      clearInterval(landlordInterval);
      clearInterval(tenantInterval);
    };
  }, []);

 const [formData, setFormData] = useState({
   name: "",
   email: "",
   message: "",
 });

 const handleChange = (e) => {
   setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
 };

 const handleSubmit = async (e) => {
   e.preventDefault();

   try {
     const res = await fetch(
       `${import.meta.env.VITE_API_BASE_URL}/api/contact`,
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData),
       }
     );

     if (!res.ok) throw new Error("Failed to send message");

     alert("Message sent successfully!");
     setFormData({ name: "", email: "", message: "" });
   } catch (err) {
     console.error("Error sending message:", err);
     alert("Something went wrong.");
   }
 };

const handleBookClick = (property) => {
  const isLoggedInAsTenant = localStorage.getItem("userRole") === "tenant"; 
  if (!isLoggedInAsTenant) {
    alert("Please log in as a tenant to book this property.");
    window.location.href = "/login";
  } else {
    // Proceed with booking logic for the tenant
    console.log("Booking property:", property);
    // Add further logic for booking the property
  }
};

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  }
  const handleNavLinkClick = () => {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.getElementById("navbarNav");

    if (navbarCollapse.classList.contains("show")) {
      // Collapse manually
      bootstrap.Collapse.getInstance(navbarCollapse).hide();
      if (navbarToggler) {
        navbarToggler.setAttribute("aria-expanded", "false");
        // Optional: change icon back to ☰
        const span = navbarToggler.querySelector("span");
        if (span) span.textContent = "☰";
      }
    }
  };

  return (
    <div className="home-container">
      <div className="main-navbar fixed-top w-100">
        <nav className="navbar navbar-expand-md navbar-light shadow-sm px-4">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              <img
                src="https://cdn.vectorstock.com/i/1000x1000/55/07/logo-house-rental-sales-and-construction-vector-7125507.webp"
                alt="Logo"
                style={{ height: "40px" }}
              />
            </a>
            {/* Buttons stacked or spaced on mobile, full width container */}
            <div className="d-flex d-md-none justify-content-between gap-3">
              <button
                className="btn btn-outline-primary btn-sm flex-fill"
                onClick={handleLoginClick}
              >
                Login
              </button>
              <button
                className="btn btn-primary btn-sm flex-fill"
                onClick={handleRegisterClick}
              >
                Register
              </button>
            </div>
            {/* Toggler for small screens */}
            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleNavbar}
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded={isCollapsed}
              aria-label="Toggle navigation"
            >
              <span className="text-white fs-4">{isCollapsed ? "✕" : "☰"}</span>
            </button>

            {/* Centered Nav Links */}
            <div
              className="collapse navbar-collapse justify-content-center"
              id="navbarNav"
            >
              <ul className="navbar-nav nav-center-links">
                <li className="nav-item mx-4">
                  <a
                    className="nav-link"
                    href="#home"
                    onClick={() => handleNavLinkClick()}
                  >
                    Home
                  </a>
                </li>
                <li className="nav-item mx-4">
                  <a
                    className="nav-link"
                    href="#about"
                    onClick={() => handleNavLinkClick()}
                  >
                    About
                  </a>
                </li>
                <li className="nav-item mx-4">
                  <a
                    className="nav-link"
                    href="#property"
                    onClick={() => handleNavLinkClick()}
                  >
                    Property
                  </a>
                </li>
                <li className="nav-item mx-4">
                  <a
                    className="nav-link"
                    href="#testmonials"
                    onClick={() => handleNavLinkClick()}
                  >
                    Testmonials
                  </a>
                </li>
                <li className="nav-item mx-4">
                  <a
                    className="nav-link"
                    href="#contact"
                    onClick={() => handleNavLinkClick()}
                  >
                    Contact
                  </a>
                </li>
                <li className="nav-item mx-4">
                  <a
                    className="nav-link"
                    href="#help"
                    onClick={() => handleNavLinkClick()}
                  >
                    Help
                  </a>
                </li>
              </ul>
            </div>

            {/* Buttons aligned left/right on small screens */}
            <div className="d-none d-md-flex gap-3 ms-auto">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleLoginClick}
              >
                Login
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRegisterClick}
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div className="content-container">
        <div className="home-title text-center">
          <h2>Welcome to the House Rentals Management System</h2>
          <p className="lead">
            Your trusted platform for hassle-free property rentals. Explore
            listings, make bookings, and manage everything in one place.
          </p>

          <div className="position-relative d-inline-block mt-4">
            <img
              src="https://media.istockphoto.com/id/961081044/photo/house-key-in-real-estate-sale-person-or-home-insurance-broker-agents-hand-giving-to-buyer.jpg?s=1024x1024&w=is&k=20&c=r7NhpM7Z9PY3wywhAKeBCiudAG_qWUBamf773rdml7M="
              alt="Welcome Banner"
              className="img-fluid rounded-3"
              style={{ maxWidth: "100%", height: "auto", maxHeight: "400px" }}
            />

            <div
              className="position-absolute start-50 translate-middle-x text-center w-100 px-3"
              style={{ bottom: "15px" }}
            >
              <p className="lead text-primary fw-bold mb-2">
                Access your account.
              </p>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleRegisterClick}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="about" className="about-us-container my-5">
        <div className="container">
          <h2 className="text-center mb-4">About Us</h2>
          <div className="row justify-content-center">
            <div className="col-md-10">
              <p className="lead">
                At House Rentals Management System, we strive to make renting
                and listing properties as seamless as possible. Whether you're a
                landlord looking to find the right tenants, or a tenant in
                search of your next home, we provide a trusted platform that
                connects both sides effortlessly.
              </p>
              <p className="lead">
                With a growing user base and a dedicated support team, we ensure
                that every interaction on our platform is secure, transparent,
                and easy to navigate. We are committed to innovating rental
                solutions to meet the modern-day needs of both property owners
                and renters alike.
              </p>
              <p className="lead">
                Our platform leverages the latest technologies to offer smart
                features such as verified listings, automated booking requests,
                and instant messaging between landlords and tenants. These tools
                are designed to save time, reduce friction, and create a smooth
                rental experience from start to finish.
              </p>
              <p className="lead">
                We take pride in supporting local communities by promoting
                trustworthy housing options and helping landlords manage their
                properties more efficiently. Our goal is to build a reliable
                ecosystem where both parties feel heard, supported, and
                empowered.
              </p>
              <p className="lead">
                Whether you're managing multiple rental units or just beginning
                your journey to find the perfect home, House Rentals Management
                System is here to guide you every step of the way. Join us today
                and experience a better way to rent.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div id="benefit" className="container my-5">
        <h2 className="text-center mb-4">
          Why Choose Our Rental Management System?
        </h2>
        <p className="text-center text-muted mb-5">
          All-in-one platform for landlords and tenants
        </p>

        <div className="row text-center justify-content-center">
          <div className="col-md-4 mb-4">
            <div className="p-4 bg-white rounded shadow-sm counter-box">
              <i className="fas fa-money-bill-wave fa-2x text-primary mb-3"></i>
              <h5>Easy Rent Payments</h5>
              <p>Pay rent securely online and track payments anytime.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="p-4 bg-white rounded shadow-sm counter-box">
              <i className="fas fa-tools fa-2x text-success mb-3"></i>
              <h5>Maintenance Requests</h5>
              <p>Submit, track, and manage repair requests in real time.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="p-4 bg-white rounded shadow-sm counter-box">
              <i className="fas fa-file-contract fa-2x text-warning mb-3"></i>
              <h5>Digital Lease Agreements</h5>
              <p>Sign and view lease contracts securely online.</p>
            </div>
          </div>
        </div>
      </div>

      <div id="help" className="container my-5">
        <h2 className="text-center mb-4">How It Works</h2>
        <p className="text-center text-muted mb-5">
          Simple steps to get started
        </p>

        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="p-4 bg-white rounded shadow-sm help-box">
              <div className="display-6 fw-bold text-primary mb-3">1</div>
              <h5>Create an Account</h5>
              <p>Join as a tenant or landlord in minutes.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="p-4 bg-white rounded shadow-sm help-box">
              <div className="display-6 fw-bold text-success mb-3">2</div>
              <h5>Connect & Manage</h5>
              <p>Link your property or lease and start managing online.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="p-4 bg-white rounded shadow-sm help-box">
              <div className="display-6 fw-bold text-warning mb-3">3</div>
              <h5>Enjoy Hassle-Free Experience</h5>
              <p>
                No more paper, no confusion — everything is digital and easy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 id="property">Available Properties</h2>
      <div className="home-property my-5 container justify-content-center">
        {properties.slice(0, visibleCount).map((prop) => (
          <div className="cards mb-4" key={prop._id}>
            <div
              className="card h-100 shadow-lg rounded"
              style={{ transition: "transform 0.3s ease" }}
            >
              <div className="card-img-top" style={{ position: "relative" }}>
                {prop.images.length > 0 ? (
                  prop.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${prop.title} - Image ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  ))
                ) : (
                  <img
                    src="/placeholder.jpg"
                    alt="Placeholder"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                )}
                <p
                  style={{
                    position: "absolute",
                    bottom: "1px",
                    left: "10px",
                    fontWeight: "bold",
                    color: "#F5C518",
                  }}
                >
                  {prop.price} ETB
                </p>
                <button
                  to={`/tenant/book/${prop._id}`}
                  className="btn btn-outline-primary book-btn"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    fontWeight: "bold",
                    transition: "background-color 0.3s",
                  }}
                  onClick={() => handleBookClick(prop)}
                >
                  Book
                </button>
              </div>
              <div className="card-body">
                <h5 style={{ color: "blue" }}>{prop.title}</h5>
                <p className="card-text">{prop.description}</p>

                <p
                  style={{
                    color: "#2c3e50",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fas fa-map-marker-alt"
                    style={{ marginRight: "8px", color: "#007bff" }}
                  ></i>
                  {prop.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < properties.length && (
        <div className="text-center">
          <button
            className="btn btn-outline-primary"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            View More
          </button>
        </div>
      )}
      <div id="testmonials" className="container my-5">
        <h2 className="text-center mb-4">What Our Users Say</h2>
        <p className="text-center text-muted mb-5">
          Hear from landlords and tenants who love our platform
        </p>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="p-4 bg-white rounded shadow-sm h-100 testimonial-card">
              <p>
                "Managing my properties has never been easier. I get instant
                updates on payments and maintenance!"
              </p>
              <strong>— Sarah M., Landlord</strong>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="p-4 bg-white rounded shadow-sm h-100 testimonial-card">
              <p>
                "I used to stress about paying rent on time — now it’s just a
                click away. Highly recommend!"
              </p>
              <strong>— James L., Tenant</strong>
            </div>
          </div>
        </div>
      </div>

      <div id="client" className="container my-5">
        <h2 className="text-center mb-4">Trusted by Industry Leaders</h2>
        <p className="text-center text-muted mb-5">
          Join thousands of landlords and tenants who trust our platform
        </p>

        <div className="row text-center align-items-center">
          {/* Client Logo/Name */}
          <div className="col-md-3 col-6 mb-4">
            <div className="client-logo p-3 bg-white rounded shadow-sm">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxpBFr78-sr9TMRgzd3By5olZ92BvPiB844Q&s"
                alt="Client A"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-md-3 col-6 mb-4">
            <div className="client-logo p-3 bg-white rounded shadow-sm">
              <img
                src="https://hosearealestate.com/wp-content/uploads/2023/04/Hosea.png "
                alt="Client B"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-md-3 col-6 mb-4">
            <div className="client-logo p-3 bg-white rounded shadow-sm">
              <img
                src="https://metropolitanaddis.com/wp-content/uploads/2022/07/png-logo-sadsadsads.png"
                alt="Client C"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-md-3 col-6 mb-4">
            <div className="client-logo p-3 bg-white rounded shadow-sm">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEHy6_epkEtFLBXftyZIbdRjmW_RcOmQI-LQ&s "
                alt="Client D"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>

      <div id="contact" className="contact-container my-5">
        <div className="container">
          <h2 className="text-center mb-4">Contact Us</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Message
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-outline-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer mt-5 py-5 bg-dark text-white">
        <div className="container">
          <div className="row text-center text-md-start">
            {/* Column 1 */}
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase mb-3">Company</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#about" className="footer-link">
                    About
                  </a>
                </li>
                <li>
                  <a href="#client" className="footer-link">
                    Team
                  </a>
                </li>
                <li>
                  <a href="#benefit" className="footer-link">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase mb-3">Support</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#contact" className="footer-link">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    FAQS
                  </a>
                </li>
                <li>
                  <a href="#help" className="footer-link">
                    Help
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="col-md-4 mb-4">
              <h5 className="text-uppercase mb-3">Legal</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#home" className="footer-link">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="footer-link">
                    Testmonial
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-4 border-top mt-4">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} House Rentals Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
