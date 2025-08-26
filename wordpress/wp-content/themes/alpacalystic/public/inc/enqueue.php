<?php

/**
 * Enqueue scripts and styles
 *
 * @package Alpacalystic
 */

function alpacalystic_scripts()
{
    // Read manifest from local filesystem
    $manifest_path = get_template_directory() . '/build/webpack.manifest.json';
    $manifest = [];
    if (file_exists($manifest_path)) {
        $json = file_get_contents($manifest_path);
        $manifest = json_decode($json, true);
    }

    wp_enqueue_style(
        'google-fonts-noto-sans-jp',
        'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+JP:wght@100..900&display=swap',
        array(),
        null // The version number of the stylesheet (null lets WordPress handle caching)
    );
    wp_enqueue_style(
        'bootstrap-icons',
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@latest/font/bootstrap-icons.min.css',
        array(),
        null
    );
    if (!empty($manifest['main.css'])) {
        wp_enqueue_style(
            'main',
            get_template_directory_uri() . $manifest['main.css'],
            array(),
            _TPL_VERSION
        );
    }
    wp_enqueue_style('alpacalystic-style', get_stylesheet_uri(), array(), _TPL_VERSION);

    if (!empty($manifest['main.js'])) {
        wp_enqueue_script(
            'main',
            get_template_directory_uri() . $manifest['main.js'],
            array(),
            _TPL_VERSION,
            true
        );
    }

    if (is_singular() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }
}
add_action('wp_enqueue_scripts', 'alpacalystic_scripts');
