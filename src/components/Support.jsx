// Support.jsx

import React from "react";

const Support = ({ loggedInUser }) => {
  const tenantFAQs = [
    {
      question: "What documents do I need to provide to rent a property?",
      answer:
        "Typically, you will need to provide proof of identity (e.g., passport or driver’s license), proof of income (e.g., recent pay stubs or bank statements), and references from previous landlords.",
    },
    {
      question: "How much is the security deposit, and is it refundable?",
      answer:
        "The security deposit is usually equivalent to one or two months' rent. It is refundable at the end of the lease, provided there is no damage to the property beyond normal wear and tear.",
    },

    {
      question: "What documents do I need to provide to rent a property?",
      answer:
        "Typically, you will need to provide proof of identity (e.g., passport or driver’s license), proof of income (e.g., recent pay stubs or bank statements), and references from previous landlords.",
    },
    {
      question: "How much is the security deposit, and is it refundable?",
      answer:
        "The security deposit is usually equivalent to one or two months' rent. It is refundable at the end of the lease, provided there is no damage to the property beyond normal wear and tear.",
    },
    {
      question: "What is included in the rent?",
      answer:
        "This varies by property but may include utilities (water, electricity, gas), internet, parking, or other amenities. Make sure to clarify this with the landlord before signing the lease.",
    },
    {
      question: "Can I make modifications to the property?",
      answer:
        "Minor modifications like painting walls or installing shelves may require prior approval from the landlord. Major structural changes are usually not allowed without explicit permission.",
    },
    {
      question: "What happens if I need to break my lease early?",
      answer:
        "Breaking a lease early may result in penalties, such as forfeiting your security deposit or paying a fee. Some landlords may allow you to sublet the property to another tenant, but this must be agreed upon in advance.",
    },
    {
      question: "Are pets allowed?",
      answer:
        "Pet policies vary by landlord. Some properties may allow pets with an additional pet deposit or monthly pet rent, while others may have a strict no-pet policy.",
    },
    {
      question: "How often can the rent be increased?",
      answer:
        "Rent increases are typically allowed once per year, but this depends on the terms of your lease and local rent control laws. The landlord must provide advance notice (usually 30-60 days) before increasing the rent.",
    },
  ];

  const landlordFAQs = [
    {
      question: "What should I include in the lease agreement?",
      answer:
        "A lease agreement should include the names of the tenant(s), rental amount, payment due dates, security deposit details, lease duration, rules regarding pets, maintenance responsibilities, and any other specific terms or conditions.",
    },
    {
      question: "How do I screen potential tenants?",
      answer:
        "Tenant screening typically involves checking credit reports, verifying income, contacting previous landlords for references, and conducting background checks to ensure the tenant has a history of reliable payments and good behavior.",
    },

    {
      question: "What should I include in the lease agreement?",
      answer:
        "A lease agreement should include the names of the tenant(s), rental amount, payment due dates, security deposit details, lease duration, rules regarding pets, maintenance responsibilities, and any other specific terms or conditions.",
    },
    {
      question: "How do I screen potential tenants?",
      answer:
        "Tenant screening typically involves checking credit reports, verifying income, contacting previous landlords for references, and conducting background checks to ensure the tenant has a history of reliable payments and good behavior.",
    },
    {
      question: "What are my responsibilities as a landlord?",
      answer:
        "As a landlord, you are responsible for maintaining a safe and habitable property, addressing necessary repairs promptly, respecting tenant privacy, and complying with all local housing laws and regulations.",
    },
    {
      question: "Can I increase the rent during the lease term?",
      answer:
        "Generally, you cannot increase the rent during the lease term unless the lease agreement allows for it. However, you can raise the rent when the lease is up for renewal, provided you give proper notice.",
    },
    {
      question: "What should I do if a tenant stops paying rent?",
      answer:
        "If a tenant fails to pay rent, you should first send a formal notice reminding them of their obligation. If the issue persists, you may need to follow legal eviction procedures, which vary by jurisdiction.",
    },
    {
      question: "How do I handle a tenant who causes disturbances?",
      answer:
        "Address the issue directly with the tenant and document all incidents. If the behavior continues, you may issue a warning or begin eviction proceedings, depending on the severity of the disturbances and the terms of the lease.",
    },
    {
      question: "What insurance should I have as a landlord?",
      answer:
        "Landlord insurance typically covers property damage, liability protection, and loss of rental income. It’s advisable to consult with an insurance professional to ensure you have adequate coverage for your property.",
    },
  ];

  // Check if the user is logged in
  if (loggedInUser.email === "Guest") {
    return <div>Please log in to view FAQs.</div>;
  }

  // Determine the FAQs to display based on the user's role
  const faqsToDisplay =
    loggedInUser.role === "tenant" ? tenantFAQs : landlordFAQs;

  return (
    <div className="container mt-5 support-container">
      <h1 className="text-center mb-4">Frequently Asked Questions</h1>

      <div className="accordion" id="faqAccordion">
        {faqsToDisplay.map((faq, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded="false"
                aria-controls={`collapse${index}`}
              >
                {faq.question}
              </button>
            </h2>
            <div
              id={`collapse${index}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading${index}`}
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
