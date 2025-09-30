<?php
/**
 * Security Assessment Capture Endpoint
 * This script captures form submissions as a backup to Formspree
 * Store submissions in a secure directory outside web root
 */

// Configuration
define('STORAGE_DIR', __DIR__ . '/../../../security-assessments/'); // Outside web root
define('LOG_FILE', STORAGE_DIR . 'submissions.log');
define('MAX_FILE_SIZE', 1048576); // 1MB max

// CORS headers (adjust origin as needed)
header('Access-Control-Allow-Origin: https://backus.agency');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');

// Validate size
if (strlen($input) > MAX_FILE_SIZE) {
    http_response_code(413);
    echo json_encode(['error' => 'Payload too large']);
    exit;
}

// Parse JSON
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Validate required fields
$required = ['contactEmail', 'companyName', 'submissionId'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

// Sanitize submission ID
$submissionId = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['submissionId']);

// Add server-side metadata
$data['server_timestamp'] = date('Y-m-d H:i:s');
$data['server_ip'] = $_SERVER['REMOTE_ADDR'];
$data['server_user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

// Create storage directory if it doesn't exist
if (!is_dir(STORAGE_DIR)) {
    mkdir(STORAGE_DIR, 0700, true);
}

// Create subdirectory for date organization
$dateDir = STORAGE_DIR . date('Y-m') . '/';
if (!is_dir($dateDir)) {
    mkdir($dateDir, 0700, true);
}

// Save individual file
$filename = $dateDir . $submissionId . '.json';
$success = file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));

if (!$success) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save submission']);
    exit;
}

// Append to log file
$logEntry = date('Y-m-d H:i:s') . '|' . $submissionId . '|' . $data['contactEmail'] . '|' . $data['companyName'] . '|' . $_SERVER['REMOTE_ADDR'] . "\n";
file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);

// Send email notification (optional)
if (defined('ADMIN_EMAIL') && ADMIN_EMAIL) {
    $subject = 'New Security Assessment: ' . $data['companyName'];
    $message = "New security assessment received:\n\n";
    $message .= "Company: " . $data['companyName'] . "\n";
    $message .= "Contact: " . $data['contactName'] . " (" . $data['contactEmail'] . ")\n";
    $message .= "Industry: " . ($data['industry'] ?? 'Not specified') . "\n";
    $message .= "Timeline: " . ($data['timeline'] ?? 'Not specified') . "\n";
    $message .= "Submission ID: " . $submissionId . "\n";
    $message .= "\nView full submission: " . $filename;

    mail(ADMIN_EMAIL, $subject, $message, "From: noreply@backus.agency\r\n");
}

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'submissionId' => $submissionId,
    'timestamp' => $data['server_timestamp'],
    'message' => 'Assessment captured successfully'
]);
?>