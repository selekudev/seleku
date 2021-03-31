# Seleku JS
### apa itu seleku?
seleku adalah framework javascript yang di buat khusus untuk frontend javascript dan memliki berbagai macam tools dan utilities

### bagaimana cara seleku bekerja
seleku bekerja dengan cara mengcompile file ```.seleku``` menjadi javascript dengan dukungan dari node js hasil compile seleku merupakan kumpulan class, utility dan object yang telah di buat khusus agar mudah di gunakan

### konsep seleku
seleku mengubah seleku components ke dalam real web components sehingga memiliki performa native web components

## memulai dengan seleku
silahkan clone repo ini (seleku belum di publish masih dalam tahap pengembangan) kemudian jalankan perintah ```npm i``` untuk menginstall semua depencies yang di butuhkan setelah menginstall semua depencies maka jalankan perintah ```npm run dev-start``` dan silahkan jalankan file  ```index.html``` yang ada di folder public, dan untuk melihat perubahan yang ada di seleku silahkan otak atik file yang berekstensi ```.seleku``` di dalam folder ```res```

### seleku utility

**Memilih satu element html :**
```js
$elek('tag / .class / #id', index (opsional));
```
###### Contoh :
```js
$elek('.tombol'); // mengambil satu element
```

**Memilih element tertentu atau semua element html yang dipilih :**
```js
$elek('p', 1); // mengambil tag <p> pada index ke-1
$elek('p', 'semua'); // mengambil semua tag <p>
$elek('p', 'awal'); // mengambil tag <p> pertama
$elek('p', 'akhir'); // mengambil tag <p> terakhir
```

**Memilih satu element html dan memanipulasinya :**

###### Memberi CSS (hanya satu properti)
```js
$ku('h2').style('color', 'red');
```

###### Memberi CSS (lebih dari satu properti)
```js
$ku('.card').css({
	'background-color' : 'teal',
	'color' : '#fff'
});
```

###### Tambah tag sederhana
```js
$ku('body').tambahTag('p', 'Saya menggunakan SelekJS untuk ini!');
```

###### Tambah elemen
1. Menggunakan cara objek
```js
const seleku = new SelekuClass();

const div = seleku.tambahElemen({
	'tag' : 'div',
	'attr' : {
		'class' : 'container'
	}
});

const card = seleku.tambahElemen({
	'tag' : 'h2',
	'attr' : {
		'class' : 'card',
		'id' : 'card'
	},
	'isi' : 'Ini judul dari card menggunakan Seleku JS'
});

seleku.gabung(div, card); // menggabungkan 'card' ke 'div'

$ku('body').gabung(div); // menggabungkan ke elemen 'body' atau yang lain sesuai target ($ku)
```

2. Menggunakan cara string
```js
$ku('body').tambahElemen("<h2 class='judul' name='judul' id='judul'>Halo teman-teman.</h2>"); // Beserta Attribute
$ku('body').tambahElemen("<p>Selamat datang di web saya!</p>"); // Tanpa Attribute
```

###### Mengubah isi dari sebuah tag
```js
$ku('h2').isi('Selamat datang');
```

###### Menambah class pada tag
```js
$ku('h2').tambahClass('judul');
```

###### Toggle class
```js
$ku('h2').toggleClass('modemalam');
```

###### Log data yang ditangkap
```js
$ku('h2').log();
```

###### Event Listener
```js
$ku('.tombol').pas('click', () => {
  alert('Anda menekan tombol!');
);
```

**--- v1.2 ---**

###### Hapus element
```js
$ku('p.sinoposis').hapus();
```

###### Menambahkan attribute baru ke sebuah element
```js
$ku('h1').attr('class', 'judul');
$ku('h1').attr('id', 'judulsaya');
```

###### Menghapus sebuah attribute pada element tertentu
```js
$ku('h2').hapusAttr('class');
```

###### Menambah nilai attribute tertentu
```js
$ku('h1').tambahNilaiAttr('class', 'kelasbaru');
```

###### Menghapus nilai tertentu dari sebuah attribute
```js
$ku('h1').hapusNilaiAttr('class', 'judul');
```

## fitur seleku


### Variabel Javacsript ke html

#### seleku juga memungkinkan untuk mengakses variabel di javascript secara langsung tanpa menggunakan DOM cukup dengan menambahkan `{variable}` di mana `variabel`
#### adalah variabel javascript akses langsung


```HTML

<html>

	<h1>{namaku}</h1>	

</html>

<style type="text/css">
	h1{
		color: red;
		font-family: sans-serif;
	}
</style>

<script type="text/javascript">
	let namaku = "budiman";
</script>


```

## Mengikat dan Reaktivitas dalam `selek`
#### selek juga memiliki binding dan reaktivitas, ingat hanya untuk tag ``` input ``` dan` textarea`, untuk menggunakannya cukup tambahkan atribut `this-bind = {variable}`
#### Contoh


```HTML

<html>

	<h1>{namaku}</h1>
	<input type="text" this:bind={namaku} name="">

</html>

<style type="text/css">
	h1{
		color: red;
		font-family: sans-serif;
	}
</style>

<script type="text/javascript">
	let namaku = "budiman";
</script>


```
#### --Atau--

```HTML

<html>

	<h1>{namaku}</h1>
	<input type="text" oninput="input(this)" name="">

</html>

<style type="text/css">
	h1{
		color: red;
		font-family: sans-serif;
	}
</style>

<script type="text/javascript">
	let namaku = "budiman";
	
	function input(element){
		contexts.namaku = element.value;
	}
</script>

```

## dynamic attribute di `selek`
#### dynamic attribute adalah attribute yang memiliki reaktivitas dan memungkinkan terjadinya perubahan attribute itu sendiri secara realtime
#### Contoh


```HTML

<html>

	<h1 id={my_id}>{namaku}</h1>
	<input type="text" oninput="input(this)" name="">

</html>

<style type="text/css">
	h1{
		color: red;
		font-family: sans-serif;
	}
</style>

<script type="text/javascript">
	let namaku = "budiman";
	let my_id = "";
	
	function input(element){
		contexts.namaku = element.value;
		contexts.my_id = element.value;
	}
</script>

```
