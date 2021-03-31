// [[ Class Utama ]]
class SelekuClass {
    constructor(elemen) {
        if (elemen === null) {
            console.log('Target tidak ditemukan.');
            this.elemen = 'Tidak ada elemen!';
        }
        else {
            this.elemen = elemen;
        }
    }
    // Memberi satu properti css
    style(properti, nilai) {
        const gayaku = this.elemen.style;
        gayaku[properti] = nilai;
    }
    // Memberi lebih dari 1 properti css
    css(stylecss) {
        // Membuat index dari object
        let keys = Object.keys(stylecss);
        const gayaku = this.elemen.style;
        keys.forEach(function (p) {
            gayaku[p] = stylecss[p];
        });
    }
    // Membuat tag baru dengan isinya
    tambahTag(tag, isi) {
        let tagBaru = document.createElement(tag);
        let isiTagBaru = document.createTextNode(isi);
        tagBaru.appendChild(isiTagBaru);
        let hasilGabung = this.elemen.appendChild(tagBaru);
        return hasilGabung;
    }
    // Menambahkan elemen baru
    tambahElemen(el) {
        if (typeof (el) === 'object') {
            return this.telofObject(el);
        }
        else if (typeof (el) === 'string') {
            return this.telofString(el);
        }
    }
    // Hapus elemen
    hapus() {
        this.elemen.remove();
    }
    // Tambah attribute pada sebuah elemen html
    attr(properti, nilai) {
        return this.elemen.setAttribute(properti, nilai);
    }
    // Hapus sebuah attribute pada element
    hapusAttr(att) {
        this.elemen.removeAttribute(attr);
    }
    // Tambah nilai baru pada attribute
    tambahNilaiAttr(properti, nilai) {
        let nilai_full = this.elemen.getAttribute(properti) + ' ' + nilai;
        return this.elemen.setAttribute(properti, nilai_full);
    }
    // Hapus sebuah nilai pada attribute
    hapusNilaiAttr(properti, nilai) {
        let nilai_full = this.elemen.getAttribute(properti);
        return this.elemen.setAttribute(properti, nilai_full.replace(nilai, ''));
    }
    //mengupdate nilai attribute
    updateNilaiAttr(properti, nilai) {
        if (this.elemen) {
            this.elemen.setAttribute(properti, nilai);
        }
    }
    // Method tambahElement (Parameter = Object)
    telofObject(el) {
        const tag = document.createElement(el.tag);
        let keys;
        // Cek Attribute
        if (el.attr != undefined) {
            keys = Object.keys(el.attr);
            if (keys.length > 0) {
                keys.forEach((k) => {
                    tag.setAttribute(k, el.attr[k]);
                });
            }
        }
        // Cek Isi
        if (el.isi != undefined) {
            tag.innerHTML = el.isi;
        }
        else {
            tag.innerHTML = '';
        }
        return tag;
    }
    // Method tambahElement (Parameter = String)
    telofString(el) {
        // Tag Pembuka
        const t1 = el.indexOf('>');
        // Tag Penutup
        const t2 = el.lastIndexOf('<');
        // Tag dan isinya
        const tag_full = el.slice(1, t1);
        const isi = el.slice(t1 + 1, t2);
        //Gabung Bagian Element HTML
        const cari_spasi = tag_full.search(' ');
        let tag;
        if (cari_spasi < 0) {
            // # Jika tidak ada attribute
            tag = tag_full.slice(0, t1);
            const tagBaru = document.createElement(tag);
            const isiBaru = document.createTextNode(isi);
            tagBaru.appendChild(isiBaru);
            return this.elemen.appendChild(tagBaru);
        }
        else {
            // # Jika ada attribute
            // Spasi dalam tag pembuka
            const spasi1 = el.indexOf(' ');
            // Ketika ada attribute
            const tag_temp = tag_full.slice(spasi1);
            const attr_temp = tag_temp.split(' ');
            // Buat tag
            tag = tag_full.slice(0, spasi1 - 1);
            const tag_baru = document.createElement(tag);
            const isiBaru = document.createTextNode(isi);
            tag_baru.appendChild(isiBaru);
            // console.log(tag_baru);
            // Looping attribute
            attr_temp.forEach((a) => {
                const samadengan = a.indexOf('=');
                // console.log(a);
                // console.log(samadengan.);
                const attr_baru = a.slice(0, samadengan);
                const nilai_attr = a.slice(samadengan + 2, a.length - 1);
                // console.log(nilai_attr);
                // Menggabungkan properti dan nilai dari attr.
                tag_baru.setAttribute(attr_baru, nilai_attr);
            });
            return this.elemen.appendChild(tag_baru);
        }
    }
    // Mengganti isi elemen
    isi(data) {
        return this.isi.innerHTML(data);
    }
    // Menambah class pada tag
    tambahClass(namaClass) {
        const hasil_tambahClass = this.elemen.classList.add(namaClass);
        return hasil_tambahClass;
    }
    // Toggle class pada tag
    toggleClass(namaClass) {
        const hasil_toggleClass = this.elemen.classList.toggle(namaClass);
        return hasil_toggleClass;
    }
    // Log elemen yang dipilih
    log() {
        console.log(this.elemen);
    }
    // EventListener
    pas(event, aksi) {
        return this.elemen.addEventListener(event, aksi);
    }
    // Gabung Elemen
    gabung(el1, el2) {
        // Cek Parameter
        if (el2 != undefined) {
            return el1.appendChild(el2);
        }
        else {
            return this.elemen.appendChild(el1);
        }
    }
}
// [[ Mengambil Satu Elemen ]]
function $elek(elemen, indeks) {
    if (typeof (indeks) === 'number') {
        const els_html = document.querySelectorAll(elemen)[indeks]; // ambil elemen-elemen
        if (els_html === undefined) {
            console.log('SelekuJS : indeks yang anda pilih tidak ada');
        }
        else {
            return els_html;
        }
    }
    else if (typeof (indeks) === 'string') {
        if (indeks === 'semua') {
            const els_html = document.querySelectorAll(elemen); // ambil semua elemen
            return els_html;
        }
        else if (indeks === 'awal') {
            return document.querySelectorAll(elemen)[0]; // ambil elemen pertama
        }
        else if (indeks === 'akhir') {
            const jml_el = document.querySelectorAll(elemen); // ambil elemen pertama
            return document.querySelectorAll(elemen)[jml_el.length - 1]; // ambil elemen pertama
        }
        else {
            console.log('SelekuJS : Parameter tidak benar');
        }
    }
    else {
        const el_html = document.querySelector(elemen); // ambil elemen
        return el_html;
    }
}
// [[ Mengambil Satu Elemen dan Memanipulasinya ]]
function $ku(elemen, indeks) {
    let el_html;
    if (elemen instanceof HTMLElement || typeof elemen !== "string" && typeof elemen !== "number") {
        el_html = elemen;
    }
    else {
        el_html = document.querySelector(elemen);
    } // ambil elemen
    return new SelekuClass(el_html); // membuat objek dan mengirimkan elemen tadi
}
