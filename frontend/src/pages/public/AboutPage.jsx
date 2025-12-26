import React from "react";
import { Shield, Target, Eye, Scale } from "lucide-react";

const AboutPage = () => {
  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description:
        "Upholding honesty and strong moral principles in all our actions and decisions.",
      color: "from-neon-green to-green-400",
    },
    {
      icon: Scale,
      title: "Accountability",
      description:
        "Taking responsibility for institutional actions and ensuring transparency in operations.",
      color: "from-neon-blue to-blue-400",
    },
    {
      icon: Eye,
      title: "Transparency",
      description:
        "Promoting openness in communication and operations across the university.",
      color: "from-purple-400 to-pink-400",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Striving for the highest standards in ethics and anti-corruption practices.",
      color: "from-orange-400 to-red-400",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
            About <span className="neon-text">HUEACC</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building a culture of integrity, transparency, and accountability at
            Haramaya University
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold font-display mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To foster a culture of ethics and integrity within Haramaya
                University by promoting transparency, accountability, and
                ethical conduct among students, staff, and faculty. We strive to
                create an environment where corruption is actively prevented and
                reported.
              </p>
            </div>

            {/* Vision */}
            <div className="glass-card">
              <h2 className="text-2xl font-bold font-display mb-4">
                Our Vision
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To be a leading force in building an ethical academic community
                free from corruption, where integrity is valued, transparency is
                practiced, and accountability is upheld by all members of the
                university.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide our actions and shape our commitment to
              fighting corruption
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="glass-card hover-lift group cursor-pointer text-center"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">What We Do</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-3">
                Anonymous Reporting
              </h3>
              <p className="text-sm text-muted-foreground">
                Provide a secure platform for community members to report
                corruption and ethical violations anonymously.
              </p>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-3">
                Awareness Campaigns
              </h3>
              <p className="text-sm text-muted-foreground">
                Organize events, workshops, and seminars to raise awareness
                about ethics and anti-corruption.
              </p>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-3">Case Management</h3>
              <p className="text-sm text-muted-foreground">
                Investigate and manage reported cases with confidentiality and
                professional integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="glass-card text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold font-display mb-4">
              Get Involved
            </h2>
            <p className="text-muted-foreground mb-6">
              Join us in our mission to promote ethics and fight corruption at
              Haramaya University.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/report" className="btn-primary">
                Submit a Report
              </a>
              <a href="/contact" className="btn-secondary">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
