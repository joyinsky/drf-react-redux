from rest_framework import routers


class SharedAPIRootRouter():
    router = routers.DefaultRouter(trailing_slash=False)

    def register(self, *args, **kwargs):
        self.router.register(*args, **kwargs)
