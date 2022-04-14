<?php
function update_whitelist(){
    $myfile = fopen("../src/assets/json/config.json", "w");
    $c = file_get_contents('https://drive.google.com/uc?id=1UTyyx4BMddTaz4n2jWigRG19rWfYyYtt&export=download');
    fwrite($myfile, $c);
    fclose($myfile);
    return array("status"=>"whitelist updated");
    die('config updated');
}

function update_metas($conn,$payload){
    $products_array = array();
    $products_query = mysqli_query($conn,"SELECT id, name, local_name, keywords, meta_description as description,IF(meta_image IS NULL,photo,meta_image) as image FROM products");
    while($product = mysqli_fetch_object($products_query)){
        $product->title = "Buy ".ucwords($product->name)." Online | Shop Now in Kalyan, Dombivli, Thakurli | Get Delivery under 90 minutes* | BARAZKI";
        $product->keywords = $product->keywords .", ".$product->local_name .", Fresh, FarmFresh, Vegetables, Fruits, Shop Online, Delivery included";
        $product->link_name = str_replace(' ','-',strtolower($product->name));
        unset($product->meta_description);
        unset($product->local_name);
        $products_array[$product->id] = $product;
    }
    $categories_array = array();
    $categories_query = mysqli_query($conn,"SELECT id, meta_title, name, meta_description as description, IF(meta_image IS NULL,image,meta_image) as image FROM products_categories");
    while ($category = mysqli_fetch_object($categories_query)) {
        $category->title = $category->meta_title ?? 'Buy '.ucwords($category->name).' Online | Shop Now in Kalyan Dombivali, Thakurli | Get Delivery in 90 minutes* | BARAZKI';
        $category->image = '/src/assets/images/categories/'.$category->image;
        $category->twitter_image = explode('.',$category->image)[0].'_1200x630.jpg'.explode('.',$category->image)[1];
        unset($category->meta_title);
        unset($category->meta_description);
        $categories_array[str_replace(" ","-",strtolower($category->name))] = $category;
    }
    $metas = json_decode(file_get_contents("../meta_values.json"));
    $metas[0] = json_decode(file_get_contents(json_decode(file_get_contents('../src/web_app/json/config.json'))->cdn_url.'json/meta_values.json'))[0];
    $metas[1] = $categories_array;
    $metas[2] = $products_array;
    $myfile = fopen("../meta_values.json","w") or my_error(500);
    fwrite($myfile,str_replace('\/','/',json_encode($metas)));
    fclose($myfile);
    return "done";
}

function update_cart_config($conn,$payload){
    $myfile = fopen("../src/assets/json/cart_config.json","w") or my_error(500);
    fwrite($myfile,file_get_contents(json_decode(file_get_contents('../src/web_app/json/config.json'))->cdn_url.'json/cart_config.json'));
    fclose($myfile);
    return "done";
}
?>