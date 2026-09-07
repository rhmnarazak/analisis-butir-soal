import type ExcelJS from "exceljs";
import { JENIS_STYLES } from "../components/detail/SoalTab";
import type { Assessment, DifficultyLevel, DiscriminationLevel, QuestionAnalysis } from "../types/assessment";
import { getAnalisisRunInfo } from "./analisisInfo";
import {
  getAnalisisProgress,
  getDistraktorPercent,
  getDistraktorStatus,
  getHasilAnalisis,
  type AnalisisStats,
} from "./itemAnalysisStats";

// Same tone palette used on-screen (success/warning/error/neutral), as ARGB
// hex for ExcelJS cell fills/fonts — lets a teacher scan the sheet the same
// way they'd scan the page: Hasil Analisis colored green/orange/red/gray.
type Tone = "success" | "warning" | "error" | "neutral";
const FILL: Record<Tone, string> = {
  success: "FFE1F4EC",
  warning: "FFFFFAED",
  error: "FFFCE4E1",
  neutral: "FFF5F5F5",
};
const FONT: Record<Tone, string> = {
  success: "FF05944F",
  warning: "FFF79009",
  error: "FFE01A00",
  neutral: "FF757575",
};
const HEADER_FILL = "FF3088C8"; // primary-500
const SECTION_FILL = "FFF0F0F0"; // tertiary-100

const HASIL_TONE: Record<string, Tone> = {
  "Layak Digunakan": "success",
  "Perlu Ditinjau": "warning",
  "Perlu Diperbaiki": "error",
  "Tidak Dianalisis": "neutral",
};
const PROGRESS_TONE: Record<string, Tone> = {
  Lengkap: "success",
  Sebagian: "warning",
  "Tidak Ada": "neutral",
};
const VALIDITAS_TONE: Record<string, Tone> = { Valid: "success", "Tidak Valid": "error" };
const KESUKARAN_TONE: Record<DifficultyLevel, Tone> = {
  "Sangat Mudah": "error",
  Mudah: "warning",
  Sedang: "success",
  Sukar: "warning",
  "Sangat Sukar": "error",
};
const DAYA_PEMBEDA_TONE: Record<DiscriminationLevel, Tone> = {
  "Tinggi Sekali": "success",
  Tinggi: "success",
  Sedang: "warning",
  Rendah: "error",
  "Rendah Sekali": "error",
};
const DISTRAKTOR_TONE: Record<string, Tone> = { Efektif: "success", "Tidak Efektif": "error" };

function toneFill(tone: Tone) {
  return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: FILL[tone] } };
}

function paintTone(cell: ExcelJS.Cell, tone: Tone) {
  cell.fill = toneFill(tone);
  cell.font = { bold: true, color: { argb: FONT[tone] } };
  cell.alignment = { vertical: "middle", horizontal: "center" };
}

function sectionHeaderRow(sheet: ExcelJS.Worksheet, title: string, span = 2) {
  const row = sheet.addRow([title]);
  sheet.mergeCells(row.number, 1, row.number, span);
  row.getCell(1).font = { bold: true, size: 12, color: { argb: "FF333333" } };
  row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SECTION_FILL } };
  row.getCell(1).alignment = { vertical: "middle", indent: 1 };
  row.height = 22;
  return row;
}

function kvRow(sheet: ExcelJS.Worksheet, label: string, value: string | number) {
  const row = sheet.addRow([label, value]);
  row.getCell(1).font = { color: { argb: "FF757575" } };
  row.getCell(2).font = { bold: true, color: { argb: "FF333333" } };
  return row;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "").trim();
}

export async function exportAnalisisToExcel({
  assessment,
  stats,
  questions,
}: {
  assessment: Assessment;
  stats: AnalisisStats;
  questions: QuestionAnalysis[];
}): Promise<void> {
  const ExcelJSModule = await import("exceljs");
  const ExcelJSLib = ExcelJSModule.default ?? ExcelJSModule;
  const workbook = new ExcelJSLib.Workbook();
  workbook.creator = "Pijar Sekolah";
  workbook.created = new Date();

  const runInfo = getAnalisisRunInfo(assessment);

  // ---- Sheet 1: Ringkasan ----
  const ringkasan = workbook.addWorksheet("Ringkasan", { views: [{ showGridLines: false }] });
  ringkasan.columns = [{ width: 28 }, { width: 40 }];

  const titleRow = ringkasan.addRow(["Hasil Analisis Butir Soal"]);
  ringkasan.mergeCells(titleRow.number, 1, titleRow.number, 2);
  titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: "FF333333" } };
  titleRow.height = 28;
  const subtitleRow = ringkasan.addRow([assessment.namaUjian]);
  ringkasan.mergeCells(subtitleRow.number, 1, subtitleRow.number, 2);
  subtitleRow.getCell(1).font = { size: 12, color: { argb: "FF757575" } };
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Informasi Asesmen");
  kvRow(ringkasan, "Mata Pelajaran", assessment.mataPelajaran);
  kvRow(ringkasan, "Tingkat / Kelas", `${assessment.tingkat} / ${assessment.kelas}`);
  kvRow(ringkasan, "Jumlah Peserta", assessment.jumlahPeserta);
  kvRow(ringkasan, runInfo.label.replace(" :", ""), runInfo.tanggal);
  kvRow(ringkasan, "Oleh", runInfo.oleh);
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Kualitas Paket Soal");
  kvRow(ringkasan, "Skor Kualitas", `${stats.skorKualitas.toFixed(1)}%`);
  kvRow(ringkasan, "Kategori", stats.kualitasLabel);
  kvRow(ringkasan, "Soal Layak Digunakan", `${stats.layak} soal`);
  kvRow(ringkasan, "Soal Perlu Ditinjau", `${stats.ditinjau} soal`);
  kvRow(ringkasan, "Soal Perlu Diperbaiki", `${stats.diperbaiki} soal`);
  kvRow(ringkasan, "Soal Tidak Dianalisis", `${stats.tidakDianalisis} soal`);
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Reliabilitas Tes");
  kvRow(ringkasan, "Nilai", stats.reliabilitas.toFixed(2));
  kvRow(ringkasan, "Kategori", stats.reliabilitasLabel);
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Cakupan Analisis");
  kvRow(ringkasan, "Total Soal", stats.totalSoal);
  kvRow(ringkasan, "Soal Dapat Dianalisis", stats.totalAnalyzable);
  kvRow(ringkasan, "Soal Tidak Dapat Dianalisis", stats.tidakDianalisis);
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Distribusi Validitas");
  kvRow(ringkasan, "Valid", `${stats.validCount} soal`);
  kvRow(ringkasan, "Tidak Valid", `${stats.tidakValidCount} soal`);
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Distribusi Tingkat Kesukaran");
  (Object.keys(stats.kesukaranCount) as DifficultyLevel[]).forEach((label) => {
    kvRow(ringkasan, label, `${stats.kesukaranCount[label]} soal`);
  });
  kvRow(ringkasan, "Rata-Rata Kesukaran (P)", stats.avgKesukaran.toFixed(2));
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Distribusi Daya Pembeda");
  (Object.keys(stats.dayaPembedaCount) as DiscriminationLevel[]).forEach((label) => {
    kvRow(ringkasan, label, `${stats.dayaPembedaCount[label]} soal`);
  });
  kvRow(ringkasan, "Rata-Rata Daya Pembeda (D)", stats.avgDayaPembeda.toFixed(2));
  ringkasan.addRow([]);

  sectionHeaderRow(ringkasan, "Distribusi Efektivitas Distraktor");
  kvRow(ringkasan, "Efektif", `${stats.efektifCount} soal`);
  kvRow(ringkasan, "Tidak Efektif", `${stats.tidakEfektifCount} soal`);
  kvRow(ringkasan, "Soal Pilihan Ganda Dianalisis", `${stats.distraktorApplicableCount} soal`);

  // ---- Sheet 2: Daftar Analisis Soal ----
  const detail = workbook.addWorksheet("Daftar Analisis Soal", {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
  });
  detail.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Soal", key: "soal", width: 55 },
    { header: "Jenis", key: "jenis", width: 16 },
    { header: "Validitas (r)", key: "validitasNilai", width: 13 },
    { header: "Validitas", key: "validitasLabel", width: 13 },
    { header: "Kesukaran (P)", key: "kesukaranNilai", width: 14 },
    { header: "Kesukaran", key: "kesukaranLabel", width: 13 },
    { header: "Daya Pembeda (D)", key: "dayaPembedaNilai", width: 16 },
    { header: "Daya Pembeda", key: "dayaPembedaLabel", width: 14 },
    { header: "Distraktor (%)", key: "distraktorNilai", width: 14 },
    { header: "Distraktor", key: "distraktorLabel", width: 14 },
    { header: "Analisis", key: "analisis", width: 12 },
    { header: "Hasil Analisis", key: "hasilAnalisis", width: 18 },
  ];

  const headerRow = detail.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  questions.forEach((q) => {
    const distraktorPercent = getDistraktorPercent(q);
    const analisis = getAnalisisProgress(q);
    const hasil = getHasilAnalisis(q);
    const row = detail.addRow({
      no: q.no,
      soal: q.cuplikanSoal,
      jenis: JENIS_STYLES[q.jenis].label,
      validitasNilai: q.validitas?.value ?? null,
      validitasLabel: q.validitas?.label ?? "Tidak Dianalisis",
      kesukaranNilai: q.tingkatKesukaran?.value ?? null,
      kesukaranLabel: q.tingkatKesukaran?.label ?? "Tidak Dianalisis",
      dayaPembedaNilai: q.dayaPembeda?.value ?? null,
      dayaPembedaLabel: q.dayaPembeda?.label ?? "Tidak Dianalisis",
      distraktorNilai: distraktorPercent !== null ? distraktorPercent / 100 : null,
      distraktorLabel: getDistraktorStatus(q),
      analisis,
      hasilAnalisis: hasil,
    });

    row.getCell("no").alignment = { horizontal: "center" };
    row.getCell("soal").alignment = { wrapText: true, vertical: "top" };
    ["validitasNilai", "kesukaranNilai", "dayaPembedaNilai"].forEach((key) => {
      const cell = row.getCell(key);
      cell.numFmt = "0.00";
      cell.alignment = { horizontal: "center" };
    });
    const distraktorCell = row.getCell("distraktorNilai");
    distraktorCell.numFmt = "0.0%";
    distraktorCell.alignment = { horizontal: "center" };

    paintTone(row.getCell("validitasLabel"), VALIDITAS_TONE[q.validitas?.label ?? ""] ?? "neutral");
    if (q.tingkatKesukaran) paintTone(row.getCell("kesukaranLabel"), KESUKARAN_TONE[q.tingkatKesukaran.label]);
    else paintTone(row.getCell("kesukaranLabel"), "neutral");
    if (q.dayaPembeda) paintTone(row.getCell("dayaPembedaLabel"), DAYA_PEMBEDA_TONE[q.dayaPembeda.label]);
    else paintTone(row.getCell("dayaPembedaLabel"), "neutral");
    paintTone(row.getCell("distraktorLabel"), DISTRAKTOR_TONE[getDistraktorStatus(q)] ?? "neutral");
    paintTone(row.getCell("analisis"), PROGRESS_TONE[analisis]);
    paintTone(row.getCell("hasilAnalisis"), HASIL_TONE[hasil]);

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } },
      };
    });
  });

  detail.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: detail.columns.length } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Hasil Analisis Butir Soal - ${sanitizeFileName(assessment.namaUjian)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
