<?php
    # we are a PNG image
    header('Content-type: image/png');
     
    # we are an attachment (eg download), and we have a name
    header('Content-Disposition: attachment; filename="' . $_POST['name'] .'"');
     
    #capture, replace any spaces w/ plusses, and decode
    $encoded = $_POST['imgdata'];
    $encoded = str_replace(' ', '+', $encoded);
    $decoded = base64_decode($encoded);

//ƒgƒŠƒ~ƒ“ƒO
    $im = new Imagick();
    $im->readimageblob($decoded);
//    $im->chopImage(10,20,$im->getImageWidth()-50, $im->getImageHeight()-20);
    $im->trimImage(0);
    $imageBlob = $im->getImageBlob();
    #write decoded data
    echo $imageBlob;
?>