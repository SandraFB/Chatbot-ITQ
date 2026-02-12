import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ChatLog {
  id: string;
  message: string;
  response: string;
  tokens_used: number;
  response_time_ms: number;
  status: string;
  created_at: string;
  profiles?: {
    nombre_completo: string;
    email: string;
  };
}

interface Analytics {
  total_chats: number;
  successful_chats: number;
  failed_chats: number;
  avg_response_time: number;
  unique_users: number;
}

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
}

export const exportToPDF = (
  analytics: Analytics | null,
  chatLogs: ChatLog[],
  documents: Document[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Reporte de Análisis del Chatbot", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha de generación: ${format(new Date(), "PPP", { locale: es })}`, pageWidth / 2, 28, { align: "center" });

  // Analytics Section
  if (analytics) {
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("Resumen Estadístico", 14, 45);

    const successRate = analytics.total_chats > 0
      ? ((analytics.successful_chats / analytics.total_chats) * 100).toFixed(1)
      : "0";

    const avgResponseTime = analytics.avg_response_time
      ? (Number(analytics.avg_response_time) / 1000).toFixed(2)
      : "0";

    autoTable(doc, {
      startY: 50,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total de Consultas", analytics.total_chats.toString()],
        ["Consultas Exitosas", analytics.successful_chats.toString()],
        ["Consultas Fallidas", analytics.failed_chats.toString()],
        ["Tasa de Éxito", `${successRate}%`],
        ["Tiempo Promedio de Respuesta", `${avgResponseTime}s`],
        ["Usuarios Únicos", analytics.unique_users.toString()],
      ],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });
  }

  // Documents Section
  const finalY = (doc as any).lastAutoTable.finalY || 95;
  
  doc.setFontSize(16);
  doc.text("Documentos en el Sistema", 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Título", "Tipo", "Estado", "Fecha"]],
    body: documents.slice(0, 10).map((doc) => [
      doc.title.substring(0, 30) + (doc.title.length > 30 ? "..." : ""),
      doc.file_type.split("/")[1]?.toUpperCase() || doc.file_type,
      doc.status,
      format(new Date(doc.created_at), "dd/MM/yyyy", { locale: es }),
    ]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Chat Logs Section (New Page)
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Consultas Recientes", 14, 20);

  const chatData = chatLogs.slice(0, 20).map((log) => [
    format(new Date(log.created_at), "dd/MM HH:mm", { locale: es }),
    log.profiles?.nombre_completo || "Anónimo",
    log.message.substring(0, 40) + (log.message.length > 40 ? "..." : ""),
    `${(log.response_time_ms / 1000).toFixed(2)}s`,
    log.status,
  ]);

  autoTable(doc, {
    startY: 25,
    head: [["Fecha", "Usuario", "Consulta", "Tiempo", "Estado"]],
    body: chatData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 70 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "TecNM Campus Querétaro - Sistema de Análisis de Chatbot",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }

  // Save PDF
  doc.save(`reporte-chatbot-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const exportToExcel = (
  analytics: Analytics | null,
  chatLogs: ChatLog[],
  documents: Document[]
) => {
  const workbook = XLSX.utils.book_new();

  // Analytics Sheet
  if (analytics) {
    const successRate = analytics.total_chats > 0
      ? ((analytics.successful_chats / analytics.total_chats) * 100).toFixed(1)
      : "0";

    const avgResponseTime = analytics.avg_response_time
      ? (Number(analytics.avg_response_time) / 1000).toFixed(2)
      : "0";

    const analyticsData = [
      ["Reporte de Análisis del Chatbot"],
      [`Fecha de generación: ${format(new Date(), "PPP", { locale: es })}`],
      [],
      ["Resumen Estadístico"],
      ["Métrica", "Valor"],
      ["Total de Consultas", analytics.total_chats],
      ["Consultas Exitosas", analytics.successful_chats],
      ["Consultas Fallidas", analytics.failed_chats],
      ["Tasa de Éxito", `${successRate}%`],
      ["Tiempo Promedio de Respuesta", `${avgResponseTime}s`],
      ["Usuarios Únicos", analytics.unique_users],
    ];

    const analyticsSheet = XLSX.utils.aoa_to_sheet(analyticsData);
    
    // Style the header
    analyticsSheet["!cols"] = [{ width: 30 }, { width: 20 }];
    
    XLSX.utils.book_append_sheet(workbook, analyticsSheet, "Resumen");
  }

  // Chat Logs Sheet
  const chatLogsData = [
    ["Consultas Registradas"],
    [],
    ["Fecha y Hora", "Usuario", "Email", "Consulta", "Respuesta", "Tiempo (ms)", "Estado"],
    ...chatLogs.map((log) => [
      format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: es }),
      log.profiles?.nombre_completo || "Anónimo",
      log.profiles?.email || "N/A",
      log.message,
      log.response,
      log.response_time_ms,
      log.status,
    ]),
  ];

  const chatLogsSheet = XLSX.utils.aoa_to_sheet(chatLogsData);
  chatLogsSheet["!cols"] = [
    { width: 20 },
    { width: 25 },
    { width: 30 },
    { width: 50 },
    { width: 60 },
    { width: 12 },
    { width: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, chatLogsSheet, "Consultas");

  // Documents Sheet
  const documentsData = [
    ["Documentos del Sistema"],
    [],
    ["Título", "Nombre de Archivo", "Tipo", "Tamaño (KB)", "Estado", "Fecha de Creación"],
    ...documents.map((doc) => [
      doc.title,
      doc.file_name,
      doc.file_type,
      (doc.file_size / 1024).toFixed(2),
      doc.status,
      format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: es }),
    ]),
  ];

  const documentsSheet = XLSX.utils.aoa_to_sheet(documentsData);
  documentsSheet["!cols"] = [
    { width: 30 },
    { width: 30 },
    { width: 35 },
    { width: 15 },
    { width: 15 },
    { width: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, documentsSheet, "Documentos");

  // Statistics by Date Sheet
  const dateStats = new Map<string, { total: number; success: number; failed: number }>();
  
  chatLogs.forEach((log) => {
    const date = format(new Date(log.created_at), "yyyy-MM-dd");
    const current = dateStats.get(date) || { total: 0, success: 0, failed: 0 };
    current.total++;
    if (log.status === "success") current.success++;
    else current.failed++;
    dateStats.set(date, current);
  });

  const statsData = [
    ["Estadísticas por Fecha"],
    [],
    ["Fecha", "Total", "Exitosas", "Fallidas", "Tasa de Éxito (%)"],
    ...Array.from(dateStats.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, stats]) => [
        format(new Date(date), "dd/MM/yyyy", { locale: es }),
        stats.total,
        stats.success,
        stats.failed,
        ((stats.success / stats.total) * 100).toFixed(1),
      ]),
  ];

  const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
  statsSheet["!cols"] = [{ width: 15 }, { width: 10 }, { width: 12 }, { width: 12 }, { width: 18 }];

  XLSX.utils.book_append_sheet(workbook, statsSheet, "Estadísticas Diarias");

  // Save Excel
  XLSX.writeFile(workbook, `reporte-chatbot-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
};
