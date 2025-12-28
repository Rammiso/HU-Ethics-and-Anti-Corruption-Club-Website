import React from "react";
import { motion } from "framer-motion";
import { Shield, Target, Eye, Scale } from "lucide-react";
import {
  pageVariants,
  fadeUp,
  staggerContainer,
  holographicCard,
  glowButton,
  cardSweep,
} from "../../utils/motionVariants";

const AboutPage = () => {
  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description:
        "Upholding honesty and strong moral principles in all our actions and decisions.",
      color: "from-neon-green to-green-400",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    },
    {
      icon: Scale,
      title: "Accountability",
      description:
        "Taking responsibility for institutional actions and ensuring transparency in operations.",
      color: "from-neon-blue to-blue-400",
      image:
        "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop",
    },
    {
      icon: Eye,
      title: "Transparency",
      description:
        "Promoting openness in communication and operations across the university.",
      color: "from-purple-400 to-pink-400",
      image:
        "https://images.unsplash.com/photo-1558494949-efbeb6cb535b?q=80&w=2069&auto=format&fit=crop",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Striving for the highest standards in ethics and anti-corruption practices.",
      color: "from-orange-400 to-red-400",
      image:
        "https://images.unsplash.com/photo-1480506132288-68f7705954bd?q=80&w=2093&auto=format&fit=crop",
    },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl font-bold font-display mb-6"
          >
            About <span className="neon-text">HUEACC</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Building a culture of integrity, transparency, and accountability at
            Haramaya University
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Mission */}
            <motion.div
              variants={holographicCard}
              initial="rest"
              whileHover="hover"
              className="glass-card relative overflow-hidden group"
            >
              <motion.div
                variants={cardSweep}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-0 pointer-events-none"
              />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold font-display mb-4 group-hover:text-neon-green transition-colors">
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To foster a culture of ethics and integrity within Haramaya
                  University by promoting transparency, accountability, and
                  ethical conduct among students, staff, and faculty. We strive
                  to create an environment where corruption is actively
                  prevented and reported.
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              variants={holographicCard}
              initial="rest"
              whileHover="hover"
              className="glass-card relative overflow-hidden group"
            >
              <motion.div
                variants={cardSweep}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-0 pointer-events-none"
              />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold font-display mb-4 group-hover:text-neon-blue transition-colors">
                  Our Vision
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be a leading force in building an ethical academic
                  community free from corruption, where integrity is valued,
                  transparency is practiced, and accountability is upheld by all
                  members of the university.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold font-display mb-4"
            >
              Our Core Values
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              These principles guide our actions and shape our commitment to
              fighting corruption
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div key={index} variants={fadeUp} className="h-full">
                  <motion.div
                    variants={holographicCard}
                    initial="rest"
                    whileHover="hover"
                    className="glass-card group cursor-pointer text-center h-full relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]"
                  >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0 opacity-50 group-hover:opacity-70 transition-opacity duration-500">
                      <img
                        src={value.image}
                        alt={value.title}
                        className="w-full h-full object-cover transition-all duration-500 scale-100 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background/90" />
                    </div>

                    <motion.div
                      variants={cardSweep}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-0 pointer-events-none"
                    />

                    <div className="relative z-10 p-4">
                      <div
                        className={`w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold font-display mb-4"
            >
              What We Do
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            <motion.div variants={fadeUp}>
              <motion.div
                variants={holographicCard}
                initial="rest"
                whileHover="hover"
                className="glass-card h-full relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-neon-green transition-colors">
                    Anonymous Reporting
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Provide a secure platform for community members to report
                    corruption and ethical violations anonymously.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <motion.div
                variants={holographicCard}
                initial="rest"
                whileHover="hover"
                className="glass-card h-full relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-neon-blue transition-colors">
                    Awareness Campaigns
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Organize events, workshops, and seminars to raise awareness
                    about ethics and anti-corruption.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <motion.div
                variants={holographicCard}
                initial="rest"
                whileHover="hover"
                className="glass-card h-full relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-purple-400 transition-colors">
                    Case Management
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Investigate and manage reported cases with confidentiality
                    and professional integrity.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="glass-card text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold font-display mb-4">
              Get Involved
            </h2>
            <p className="text-muted-foreground mb-6">
              Join us in our mission to promote ethics and fight corruption at
              Haramaya University.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/report">
                <motion.button
                  variants={glowButton}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="btn-primary w-full sm:w-auto"
                >
                  Submit a Report
                </motion.button>
              </a>
              <a href="/contact">
                <motion.button
                  variants={glowButton}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="btn-secondary w-full sm:w-auto"
                >
                  Contact Us
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default AboutPage;
