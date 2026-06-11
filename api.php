<?php
// Simple Reverse Proxy to allow Ngrok users to access the port 3000 backend via port 80.
// This prevents CORS and Port blocking issues over Ngrok.

$backendPort = 3000;
$backendUrl = 'http://localhost:' . $backendPort;

$path = isset($_GET['path']) ? $_GET['path'] : '/';
$queryString = '';
foreach ($_GET as $key => $value) {
    if ($key !== 'path') {
        $queryString .= ($queryString ? '&' : '?') . urlencode($key) . '=' . urlencode($value);
    }
}
$url = $backendUrl . $path . $queryString;

$method = $_SERVER['REQUEST_METHOD'];
$headers = [];

if (function_exists('getallheaders')) {
    foreach (getallheaders() as $name => $value) {
        if (strtolower($name) !== 'host') {
            $headers[] = "$name: $value";
        }
    }
} else {
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $headers[] = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5))))) . ": $value";
        }
    }
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);

if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Bad Gateway', 'message' => 'Cannot connect to backend on port ' . $backendPort . '. Is the Node.js server running?']);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$responseHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

http_response_code($httpCode);

foreach (explode("\r\n", $responseHeaders) as $header) {
    if (trim($header) !== '' && !preg_match('/^Transfer-Encoding:/i', $header)) {
        header($header);
    }
}

echo $body;
