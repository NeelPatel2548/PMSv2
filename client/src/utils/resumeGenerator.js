import { jsPDF } from 'jspdf';

/**
 * Generate a professionally formatted PDF resume from student profile data.
 * @param {object} profile - Student profile object from GET /student/profile
 * @returns {void} - Triggers browser download
 */
export const generateResumePDF = (profile) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const colors = {
    primary: [55, 65, 81],    // slate-700
    secondary: [100, 116, 139], // slate-500
    accent: [79, 70, 229],     // indigo-600
    divider: [226, 232, 240],  // slate-200
    black: [15, 23, 42],       // slate-900
  };

  // ── Helper functions ──
  const setColor = (c) => doc.setTextColor(...c);
  const addDivider = () => {
    doc.setDrawColor(...colors.divider);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const checkPageBreak = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  };

  const addSectionTitle = (title) => {
    checkPageBreak(15);
    y += 3;
    setColor(colors.accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + doc.getTextWidth(title.toUpperCase()) + 2, y);
    y += 6;
  };

  const addField = (label, value) => {
    if (!value && value !== 0) return;
    checkPageBreak(8);
    setColor(colors.secondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${label}:`, margin, y);
    setColor(colors.primary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(String(value), margin + 40, y);
    y += 5;
  };

  // ══════════════════════════════════════════════════
  // HEADER — Name + Contact
  // ══════════════════════════════════════════════════
  const name = profile.user?.name || profile.name || 'Student';
  setColor(colors.black);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(name, margin, y);
  y += 8;

  // Contact line
  const contactParts = [];
  if (profile.user?.email) contactParts.push(profile.user.email);
  if (profile.phone) contactParts.push(profile.phone);
  if (profile.branch) contactParts.push(profile.branch);

  if (contactParts.length > 0) {
    setColor(colors.secondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(contactParts.join('  •  '), margin, y);
    y += 5;
  }

  // Links line
  const links = [];
  if (profile.linkedin) links.push(`LinkedIn: ${profile.linkedin}`);
  if (profile.github) links.push(`GitHub: ${profile.github}`);
  if (links.length > 0) {
    setColor(colors.accent);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(links.join('   |   '), margin, y);
    y += 4;
  }

  y += 2;
  addDivider();

  // ══════════════════════════════════════════════════
  // EDUCATION
  // ══════════════════════════════════════════════════
  addSectionTitle('Education');

  if (profile.enrollmentNo) addField('Enrollment', profile.enrollmentNo);
  if (profile.branch) addField('Branch', profile.branch);
  if (profile.cgpa) addField('CGPA', profile.cgpa);
  if (profile.currentSemester) addField('Semester', profile.currentSemester);
  if (profile.passingYear) addField('Passing Year', profile.passingYear);
  if (profile.tenthPercentage) addField('10th %', `${profile.tenthPercentage}%`);
  if (profile.twelfthPercentage) addField('12th %', `${profile.twelfthPercentage}%`);
  if (profile.activeBacklogs !== undefined) addField('Backlogs', profile.activeBacklogs);

  // ══════════════════════════════════════════════════
  // SKILLS
  // ══════════════════════════════════════════════════
  if (profile.skills?.length > 0) {
    addSectionTitle('Technical Skills');
    setColor(colors.primary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const skillText = profile.skills.join('  •  ');
    const lines = doc.splitTextToSize(skillText, contentWidth);
    lines.forEach(line => {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 5;
    });
  }

  // ══════════════════════════════════════════════════
  // PROJECTS
  // ══════════════════════════════════════════════════
  if (profile.projects?.length > 0) {
    addSectionTitle('Projects');

    profile.projects.forEach((project) => {
      checkPageBreak(16);
      setColor(colors.black);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(project.title || 'Untitled Project', margin, y);
      y += 5;

      if (project.description) {
        setColor(colors.primary);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(project.description, contentWidth);
        descLines.forEach(line => {
          checkPageBreak(6);
          doc.text(line, margin, y);
          y += 4.5;
        });
      }

      if (project.technologies) {
        setColor(colors.secondary);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(`Tech: ${project.technologies}`, margin, y);
        y += 4;
      }

      if (project.link) {
        setColor(colors.accent);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(project.link, margin, y);
        y += 4;
      }

      y += 3;
    });
  }

  // ══════════════════════════════════════════════════
  // CERTIFICATIONS
  // ══════════════════════════════════════════════════
  if (profile.certifications?.length > 0) {
    addSectionTitle('Certifications');

    profile.certifications.forEach((cert) => {
      checkPageBreak(10);
      setColor(colors.black);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`• ${cert.title || cert.name || 'Certificate'}`, margin, y);

      if (cert.issuer) {
        setColor(colors.secondary);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(` — ${cert.issuer}`, margin + doc.getTextWidth(`• ${cert.title || cert.name || 'Certificate'}`) + 1, y);
      }
      y += 5;
    });
  }

  // ══════════════════════════════════════════════════
  // INTERNSHIP EXPERIENCE
  // ══════════════════════════════════════════════════
  if (profile.internshipExperience) {
    addSectionTitle('Experience');
    setColor(colors.primary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const expLines = doc.splitTextToSize(profile.internshipExperience, contentWidth);
    expLines.forEach(line => {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 5;
    });
  }

  // ══════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════
  const footerY = 290;
  doc.setDrawColor(...colors.divider);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  setColor(colors.secondary);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('Generated via Placement Management System', margin, footerY);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, footerY, { align: 'right' });

  // ── Trigger download ──
  const filename = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
  doc.save(filename);
};
