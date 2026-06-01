$(function () {
    $('.sidenav').sidenav();

    AOS.init({
        easing: 'ease-in-out-sine',
        duration: 700,
        delay: 100
    });

    let fixFooterPosition = function () {
        $('.content').css('min-height', window.innerHeight - 165);
    };
    fixFooterPosition();
    $(window).resize(function () {
        fixFooterPosition();
    });

    let articleInit = function () {
        $('#articleContent a').attr('target', '_blank');

        $('#articleContent img').each(function () {
            let imgPath = $(this).attr('src');
            $(this).wrap('<div class="img-item" data-src="' + imgPath + '" data-sub-html=".caption"></div>');
            $(this).addClass('img-shadow img-margin');

            let alt = $(this).attr('alt');
            let title = $(this).attr('title');
            let captionText = '';
            if (alt === undefined || alt === '') {
                if (title !== undefined && title !== '') {
                    captionText = title;
                }
            } else {
                captionText = alt;
            }

            if (captionText !== '') {
                let captionDiv = document.createElement('div');
                captionDiv.className = 'caption';
                let captionEle = document.createElement('b');
                captionEle.className = 'center-caption';
                captionEle.innerText = captionText;
                captionDiv.appendChild(captionEle);
                this.insertAdjacentElement('afterend', captionDiv);
            }
        });

        $('#articleContent').lightGallery({
            selector: '.img-item',
            subHtmlSelectorRelative: true
        });

        const progressElement = window.document.querySelector('.progress-bar');
        if (progressElement) {
            new ScrollProgress((x, y) => {
                progressElement.style.width = y * 100 + '%';
            });
        }
    };
    articleInit();

    $('.modal').modal();

    $('#backTop').click(function () {
        $('body,html').animate({ scrollTop: 0 }, 400);
        return false;
    });

    let $nav = $('#headNav');
    let $backTop = $('.top-scroll');
    showOrHideNavBg($(window).scrollTop());
    $(window).scroll(function () {
        showOrHideNavBg($(window).scrollTop());
    });

    function showOrHideNavBg(position) {
        let showPosition = 100;
        if (position < showPosition) {
            $nav.addClass('nav-transparent');
            $backTop.slideUp(300);
        } else {
            $nav.removeClass('nav-transparent');
            $backTop.slideDown(300);
        }
    }

    $('.tooltipped').tooltip();
});
